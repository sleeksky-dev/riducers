import { reducerBuilder } from '../src/index'

test('List reducers', () => {
  const reducer = reducerBuilder('test', {stateType: 'list', keyName: 'key'})
  let state = reducer(undefined, { type: 'test/insert', payload: [{ key: 3 }] })
  expect(state).toEqual([{ key: 3 }])

  state = reducer(state, { type: 'test/insert', payload: { key: 2, foo: 'bar' } });
  expect(state).toEqual([{ key: 3 }, { key: 2, foo: 'bar' }])

  state = reducer(state, { type: 'test/insert', payload: [{ key: 1 }, { key: 4 }] });

  expect(state).toEqual([{ key: 3 }, { key: 2, foo: 'bar' }, { key: 1 }, { key: 4 }])

  state = reducer(state, { type: 'test/sort'})
  expect(state).toEqual([{ key: 1 }, { key: 2, foo: 'bar' }, { key: 3 }, { key: 4 }])

  state = reducer(state, { type: 'test/sort', sort: (a, b) => a.id < b.id ? 1 : -1 })
  expect(state).toEqual([{ key: 4 }, { key: 3 }, { key: 2, foo: 'bar' }, { key: 1 }])

  state = reducer(state, { type: 'test/delete', payload: { key: 2 } })
  expect(state).toEqual([{ key: 4 }, { key: 3 }, { key: 1 }])

  state = reducer(state, { type: 'test/delete', payload: [{ key: 1 }, { key: 4 }] })
  expect(state).toEqual([{ key: 3 }])

  state = reducer(state, { type: 'test/replace', payload: [{ key: 1 }, { key: 4 }] })
  expect(state).toEqual([{ key: 1 }, { key: 4 }])

  state = reducer(state, { type: 'test/clear' })
  expect(state).toEqual([])
})

test('Reducer initial state', () => {
  let reducer = reducerBuilder('test', {stateType: 'list', keyName: 'key'})
  let state = reducer(undefined, {type: 'foo'})
  expect(state).toEqual([])

  reducer = reducerBuilder('test', {stateType: 'map', keyName: 'key'})
  state = reducer(undefined, {type: 'foo'})
  expect(state).toEqual({})

  reducer = reducerBuilder('test', {})
  state = reducer(undefined, {type: 'foo'})
  expect(state).toEqual(null)

  reducer = reducerBuilder('test', {initialState: null, stateType: 'list'})
  state = reducer(undefined, {type: 'foo'})
  expect(state).toEqual(null)
})

test('List reducers with sort', () => {
  const reducer = reducerBuilder('test', {stateType: 'list', sort: (a, b) => +b.id - +a.id})
  let state = reducer(undefined, { type: 'test/insert', payload: [{ id: 3 }] })
  expect(state).toEqual([{ id: 3 }])

  state = reducer(state, { type: 'test/insert', payload: { id: 2, foo: 'bar' } });
  expect(state).toEqual([{ id: 3 }, { id: 2, foo: 'bar' }])

  state = reducer(state, { type: 'test/insert', payload: [{ id: 1 }, { id: 4 }] });
  expect(state).toEqual([{ id: 4 }, { id: 3 }, { id: 2, foo: 'bar' }, { id: 1 }])

  state = reducer(state, { type: 'test/delete', payload: { id: 2 } })
  expect(state).toEqual([{ id: 4 }, { id: 3 }, { id: 1 }])

  state = reducer(state, { type: 'test/delete', payload: [{ id: 1 }, { id: 4 }] })
  expect(state).toEqual([{ id: 3 }])

  state = reducer(state, { type: 'test/replace', payload: [{ id: 1 }, { id: 4 }] })
  expect(state).toEqual([{ id: 4 }, { id: 1 }])

  state = reducer(state, { type: 'test/clear' })
  expect(state).toEqual([])
})

// test map reducers
test('Map reducers', () => {
  const reducer = reducerBuilder('test', {stateType: 'map', keyName: 'key'})
  let state = reducer(undefined, { type: 'test/insert', payload: [{ key: 3 }] })
  expect(state).toEqual({ 3: { key: 3 } })

  state = reducer(state, { type: 'test/insert', payload: { key: 2, foo: 'bar' } });
  expect(state).toEqual({ 3: { key: 3 }, 2: { key: 2, foo: 'bar' } })

  state = reducer(state, { type: 'test/insert', payload: [{ key: 1 }, { key: 4 }] });
  expect(state).toEqual({ 3: { key: 3 }, 2: { key: 2, foo: 'bar' }, 1: { key: 1 }, 4: { key: 4 } })

  state = reducer(state, { type: 'test/delete', payload: { key: 2 } })
  expect(state).toEqual({ 3: { key: 3 }, 1: { key: 1 }, 4: { key: 4 } })

  state = reducer(state, { type: 'test/delete', payload: [{ key: 1 }, { key: 4 }] })
  expect(state).toEqual({ 3: { key: 3 } })

  state = reducer(state, { type: 'test/replace', payload: [{ key: 1 }, { key: 4 }] })
  console.log(state)
  expect(state).toEqual({ 1: { key: 1 }, 4: { key: 4 } })

  state = reducer(state, { type: 'test/clear' })
  expect(state).toEqual({})
})

test('Map keyName action types', () => {
  const reducer = reducerBuilder('test', {stateType: 'map', keyName: 'key'})
  let state = reducer(undefined, { type: 'test/insert', payload: { key: 'foo', value: 'bar' } })
  expect(state).toEqual({ foo: { key: 'foo', value: 'bar' } })

  state = reducer(state, { type: 'test/foo', payload: { value: 'baz' } })
  expect(state).toEqual({ foo: { key: 'foo', value: 'baz' } })

  state = reducer(state, { type: 'test/foo', payload: null })
  expect(state).toEqual({});
})

test('Object reducers', () => {
  const reducer = reducerBuilder('test')
  let state = reducer(undefined, { type: 'test/insert', payload: { id: 3 } })
  expect(state).toEqual({ id: 3 })

  state = reducer(state, { type: 'test/replace', payload: { id: 2, foo: 'bar' } });
  expect(state).toEqual({ id: 2, foo: 'bar' })

  state = reducer(state, { type: 'test/delete' });
  expect(state).toEqual(null)

  state = reducer(state, { type: 'test/clear' });
  expect(state).toEqual(null)
})

test('Invalid reducers', () => {
  const reducer = reducerBuilder('test')
  console.error = jest.fn();
  let state = reducer(null, { type: 'test/invalid' })
  expect(console.error).toHaveBeenCalled();
})

test('Numeric state', () => {
  const reducer = reducerBuilder('test')
  let state = reducer(0, { type: 'test/insert', payload: 10 })
  expect(state).toEqual(10)
})
