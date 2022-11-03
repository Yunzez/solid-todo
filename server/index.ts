import { createPubSub, createServer, PubSub } from "@graphql-yoga/node";

const TODOS_CHANNEL = "TODOS_CHANNEL"

const pubsub = createPubSub()

let todos = [
    { id: '1', text: 'learn graphql', done: false }
]

const currTypeDefs = `
    type Todo {
        id: ID!
        done: Boolean!
        text: String!
    }
    type Query {
        getTodos: [Todo]!
    }

    type Mutation {
        addTodo(text: String!): Todo
        setDone(id: ID!, done: Boolean!): Todo
    }

    type Subscription {
        todos: [Todo]!
    }
`;
const resolvers = {
    Query: {
        getTodos: () => {
            return todos;
        },
    },
    Mutation: {
        addTodo: (_: unknown , {text}: {text: string}) => {
            const newTodo = {
                id:  String(todos.length + 1),
                text: text, 
                done: false
            }
            todos.push(newTodo)
            pubsub.publish("TODOS_CHANNEL", {todos})
            return newTodo;
        },

        setDone: (_: unknown , {id, done}: {id: string, done: boolean}, 
            ) => {
           
            const todo = todos.find(todo => todo.id === id)
            if(!todo) {
                throw new Error('Todo with the id not found')
            }
            todo.done = done
            pubsub.publish("TODOS_CHANNEL", {todos})
            return todo;
        }
    }, 
    Subscription: {
        TODOS_CHANNEL: {
            subscribe: () => pubsub.subscribe('TODOS_CHANNEL')
        }
    }
};

const server = createServer({
    schema: {
        typeDefs: currTypeDefs,
        resolvers: resolvers
    }
})


server.start()