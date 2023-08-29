
type Id = number | string;

interface ModelObj {
  [key: string]: any;
}

type SortFn = (a: ModelObj, b: ModelObj) => number;

interface ListAction {
  payload: ModelObj | ModelObj[];
  sort?: SortFn;
  keyName: string;
}

interface ListSortAction {
  sort?: SortFn;
  keyName: string;
}

const keySort = (key: string) => (a: ModelObj, b: ModelObj) => {
  if (typeof a[key] === 'number' && typeof b[key] === 'number') return a[key] - b[key];
  else if (typeof a[key] === 'string' && typeof b[key] === 'string') return a[key].localeCompare(b[key]);
  return 0;
};

const mapInsertReducer = (state: ModelObj, action: ListAction) => {
  if (!state) state = {};
  let resp: ModelObj[] = Array.isArray(action.payload) ? action.payload : [action.payload];
  state = Object.assign({}, state);
  for (let i in resp) {
    state[resp[i][action.keyName]] = Object.assign({}, resp[i]);
  }
  return state;
}

const mapDeleteReducer = (state: ModelObj, action: ListAction) => {
  if (!state) state = {};
  let resp: ModelObj[] = Array.isArray(action.payload) ? action.payload : [action.payload];
  state = Object.assign({}, state);
  for (let i in resp) {
    delete state[resp[i][action.keyName]];
  }
  return state;
}

const mapReplaceReducer = (state: ModelObj, action: ListAction) => {
  state = {};
  let resp: ModelObj[] = Array.isArray(action.payload) ? action.payload : [action.payload];
  for (let i in resp) {
    state[resp[i][action.keyName]] = Object.assign({}, resp[i]);
  }
  return state;
}

const mapClearReducer = () => {
  return {};
}

const listInsertReducer = (state: ModelObj[], action: ListAction) => {
  if (!state) state = [];
  let resp: ModelObj[] = Array.isArray(action.payload) ? action.payload : [action.payload];

  state = [...state];
  let respMap: Id[] = resp.map((r: any) => r[action.keyName]);
  let stateMap: Id[] = state.map((r: any) => r[action.keyName]);
  let toInsert: Id[] = respMap.filter((id : number | string) => stateMap.indexOf(id) < 0);
  let toReplace: Id[] = respMap.filter((id: number | string) => stateMap.indexOf(id) >= 0);
  for (let i in toReplace) {
    let stateIndex = stateMap.indexOf(toReplace[i]);
    let respIndex = respMap.indexOf(toReplace[i]);
    state[stateIndex] = Object.assign({}, resp[respIndex]);
  }
  if (toInsert.length > 0) {
    let inserts = toInsert.map((id: number | string) => resp[respMap.indexOf(id)]);
    state = [...state, ...inserts];
  }
  if (action?.sort) state.sort(action?.sort);
  return state;
}

const listSortReducer = (state: ModelObj[], action: ListSortAction) => {
  if (!state) state = [];
  state = [...state];
  let sort = action && action.sort ? action.sort : keySort(action.keyName);
  state.sort(sort);
  return state;
}

const listDeleteReducer = (state: ModelObj[], action: ListAction) => {
  if (!state) state = [];
  let resp: ModelObj[] = Array.isArray(action.payload) ? action.payload : [action.payload];

  let stateMap: Id[] = state.map((s: any) => s[action.keyName]);
  for (let i in resp) {
    let index = stateMap.indexOf(resp[i][action.keyName]);
    if (index >= 0) state.splice(index, 1);
  }
  return state;
}

const listClearReducer = () => {
  return [];
}

const listReplaceReducer = (state: ModelObj[], action: ListAction) => {
  let resp: ModelObj[] = Array.isArray(action.payload) ? action.payload : [action.payload];
  resp = resp.map((r: any) => Object.assign({}, r));
  if (action?.sort) resp.sort(action?.sort);
  return resp;
}

const objInsertReducer = (state: any, action: { payload: any }) => {
  return action.payload
}

const objReplaceReducer = (state: any, action: { payload: any }) => {
  return action.payload
}

const objDeleteReducer = () => {
  return null
}

const objClearReducer = () => {
  return null
}

interface ReducerOpts {
  stateType?: 'list' | 'map' | 'static';
  sort?: SortFn;
  keyName?: string;
  initialState?: any;
}

const OPS = ['insert', 'replace', 'delete', 'clear', 'sort'];
function reducerBuilder(key: string, opts?: ReducerOpts) {
  return (state: any, action: { type: string; payload?: any; sort?: (a: ModelObj, b: ModelObj) => number }) => {
    let isList = opts && opts?.stateType === 'list';
    let isMap = opts && opts?.stateType === 'map';
    let initialState = opts?.initialState;

    if (state === undefined) {
      if (opts?.initialState !== undefined) return opts?.initialState;
      else if (isList) return [];
      else if (isMap) return {};
      else return null;
    }
    let rx = new RegExp(`^${key}/([^\/]+)$`);
    let m = action.type.match(rx);
    if (!m) return state;
    
    let op = m[1];
    let payload = action.payload;
    let keyName = opts?.keyName ?? "id";

    if (isMap && !OPS.includes(op)) {
      if (payload && !Array.isArray(payload)) {
        payload[keyName] = op;
        op = "insert";  
      }
      if (!payload) {
        payload = {};
        payload[keyName] = op;
        op = "delete";
      }
    }

    let sort = action.sort ?? opts?.sort;
    if (op === "insert") {
      if (isList && payload) return listInsertReducer(state, {payload, sort, keyName});
      else if (isMap && payload) return mapInsertReducer(state, {payload, keyName});
      return objInsertReducer(state, {payload});
    } else if (op === "replace") {
      if (isList) return listReplaceReducer(state, {payload, sort, keyName});
      else if (isMap) return mapReplaceReducer(state, {payload, keyName});
      return objReplaceReducer(state, {payload});
    } else if (op === "delete") {
      if (isList) return listDeleteReducer(state, {payload, keyName});
      else if (isMap) return mapDeleteReducer(state, {payload, keyName});
      return objDeleteReducer();
    } else if (op === "clear") {
      if (initialState !== undefined) return initialState;
      if (isList) return listClearReducer() 
      else if (isMap) return mapClearReducer();
      return objClearReducer();
    } else if (op === "sort") {
      if (isList) return listSortReducer(state, {sort, keyName});
    } else {
      console.error(`unknown op (${op}) in action type: ${action.type}. Op should be one of: insert, delete, replace, clear, or sort.`);
    }
    return state || (isList ? [] : isMap ? {} : null);
  };
}

export { reducerBuilder };
