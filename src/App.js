import { useQuery, gql, use, useMutation } from "@apollo/client";
import { useState, useEffect } from "react";

const GET_TODOS = gql`
  query getTodos {
    todos {
      done
      id
      text
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation toggleTodo($id: uuid!, $done: Boolean!) {
    update_todos(where: { id: { _eq: $id } }, _set: { done: $done }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const ADD_TODO = gql`
  mutation addTodo($text: String!) {
    insert_todos(objects: { text: $text }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const DELETE_TODO = gql`
  mutation deleteTodo($id: uuid!) {
    delete_todos(where: { id: { _eq: $id } }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

// list
// add
// toggle
// delete

function App() {
  const [todotext, settodotext] = useState("");

  const { data, loading, error } = useQuery(GET_TODOS);

  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: () => settodotext(""),
  });
  const [deleteTodo] = useMutation(DELETE_TODO);

  async function handleToggleTodo({ id, done }) {
    const data = await toggleTodo({
      variables: {
        id,
        done: !done,
      },
    });
  }

  async function handleAddTodo(e) {
    e.preventDefault();
    if (!todotext.trim()) return;
    const data = await addTodo({
      variables: { text: todotext },
      refetchQueries: [
        {
          query: GET_TODOS,
        },
      ],
    });
  }

  async function handleDeleteTodo({ id, text }) {
    const isConfirmed = window.confirm(
      "Do you want to delete this todo? \n" + text
    );
    if (isConfirmed) {
      await deleteTodo({
        variables: { id },
        update: (cache) => {
          const prevData = cache.readQuery({ query: GET_TODOS });
          const newTodos = prevData.todos.filter((todo) => todo.id !== id);
          console.log(prevData, newTodos);
          cache.writeQuery({
            query: GET_TODOS,
            data: { todos: newTodos },
          });
        },
      });
    }
  }

  if (loading) return <div>loading...</div>;
  if (error) return <div>error fetching data</div>;

  console.log(data);
  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white pa3 fl-1">
      <h1 className="f2-l">
        GraphQl Checklist{" "}
        <span role="img" aria-label="Checkmark">
          ✓
        </span>
      </h1>

      <form className="mb3" onSubmit={(e) => handleAddTodo(e)}>
        <input
          className="pa2 f4 b--dashed"
          type="text"
          placeholder="write your todo"
          onChange={(e) => settodotext(e.target.value)}
          value={todotext}
        />
        <button className="pa2 f4 bg-green" type="submit">
          Create
        </button>
      </form>

      <div className="flex items-center justify-center flex-column">
        {data.todos.map((todo) => (
          <p key={todo.id} onDoubleClick={() => handleToggleTodo(todo)}>
            <span
              className={`pointer list pa1 f3 ${todo.done ? "strike" : ""}`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => handleDeleteTodo(todo)}
              className="bg-transparent bn f4 shadow-hover"
            >
              <span className="red">&times;</span>
            </button>
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
