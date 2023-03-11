# Dynamic Reducers for id based entities

Plug and play reducers to frontend entity based RESTful APIs.

These reducers come with insert, delete, replace, clear, and sort action types. Intercept AJAX API calls and dispatch appropriate events to maintain the entity states in redux automagically. 

## Usage

### Initializing the reducers

```TypeScript
import { configureStore } from '@reduxjs/toolkit'
import { reducerBuilder } from 'riducers'
import { combineReducers } from 'redux'

const reducer = {
  users: reducerBuilder('user', {stateType: 'list'}),
  auth: reducerBuilder('auth', {}),
  ui: {
    api: reducerBuilder('ui/api', { stateType: 'map'}),
  }
}

const store = configureStore({ reducer })

store.dispatch('user/insert', {payload: [{id: 1, name: 'John'}]})
store.dispatch('user/delete', {payload: [{id: 1}]})
store.dispatch('user/replace', {payload: [{id: 1, name: 'Foo'}, {id: 2, name: 'Bar'}]})
store.dispatch('user/sort', {})
store.dispatch('user/clear', {})

```

See the Jest tests (test/main.test.ts) for more action types and uses.
