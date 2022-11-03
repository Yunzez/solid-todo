import { Component, createSignal } from 'solid-js';
import { createResource, For } from 'solid-js';
import { createClient } from '@urql/core';

const client = createClient({
  url: "http://127.0.0.1:4000/graphql"
});

type todosType = {
  id?: number,
  done?: boolean,
  text?: string
}

const [todos, { refetch }] = createResource<todosType[]>(() =>
  client.query(`
  query {
    getTodos {
      id, done, text
    }
  }`, {}).toPromise().then((data) => data.data.getTodos)
)

const App: Component = () => {


  const [text, setText] = createSignal('')
  const toggle = async (id: number) => {
    if (typeof id == "undefined") {
      throw console.error("undefined value");

    }
    console.log(!todos()?.find(todo => todo.id == +id))
    await client.mutation(
      ` mutation($id: ID!, $done: Boolean!) {
         setDone (
            id: $id
            done:  $done
         ) {
           id
         }
       
       }`, {
      id,
      done: !todos()?.find(todo => todo.id == +id)?.done
    })
      .toPromise();
    refetch();
  }

  const onAdd = async () => {
    await client.mutation(
      ` mutation($text: String!) {
        addTodo (
           text: $text
        ) {
          id
        }
      
      }`, {
      text: text(),
    })
      .toPromise();
    refetch();
    setText("")
  }
  console.log(todos())
  return (
    <div>
      <h3>Example Todo</h3>
      <div>
        <For each={todos()}>
          {currTodo => (
            <div style={{"display": "flex", "margin-top": "10px"}}>
              <input 
              style={{
                "border-radius": "100%",
                "height": "20px",
                "width": "20px"
              }}
              type="checkbox" checked={currTodo.done} onclick={() => toggle(currTodo.id as number)} />
              <span style={{"font-size": "3vw", "margin-left": "5px"}}>{currTodo.text as string}</span>
            </div>)}
        </For>
        <div>{text()}</div>
        <div>
          <input style={
            {
              "padding": "3px",
              "border-radius": "5px",
              "border": "lightgrey 2px solid",
              "height": '40px',
              "min-width": '30vw'
            }
          } type='text'
            value={text()}
            onInput={evt => setText(evt.currentTarget.value)}
          ></input>
          <button 
          style={{
            "border": "2px white solid", 
            "width": '60px', 
            "height": '40px', 

            }} onClick={onAdd}>Add</button>
        </div>
      </div>
    </div>
  );
};

export default App;
