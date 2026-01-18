import { Effect, pipe } from "effect"
import fetch from "node-fetch"
import { ApiResponse, CreateTodoInput, Todo, TodosResponse, UpdateTodoInput } from "../models/todo"

class NetworkError extends Error { }
class InvalidResponse extends Error { }
class TypeValidationError extends Error { }

class UnexpectedError extends Error { }

type BusinessError = NetworkError | InvalidResponse | TypeValidationError


const BASE_URL = "https://dummyjson.com/todos"

export const fetchTodos = (): Effect.Effect<
    ApiResponse<Todo[]>, BusinessError, never

> =>
    pipe(
        // Step 1: fetch
        Effect.tryPromise(() => fetch(BASE_URL)),
        Effect.mapError((_err: unknown) =>
            new UnexpectedError("Unable to fetch todos, please try again later")
        ),
        // Step 2: parse JSON
        Effect.flatMap((res) =>
            pipe(
                Effect.tryPromise<TodosResponse>(() => res.json() as Promise<TodosResponse>),
                Effect.mapError((err: unknown) => {
                    console.log("Dev Error (JSON parse)", err)
                    return new UnexpectedError(
                        "Error reading server response, please try again later"
                    )
                })
            )
        ),
        // Step 3: business validation
        Effect.flatMap((typed) => {
            if (!typed.todos)
                return Effect.fail(new InvalidResponse("Todos data is missing"))
            if (!Array.isArray(typed.todos))
                return Effect.fail(new TypeValidationError("Todos must be an array"))
            return Effect.succeed({
                data: typed.todos,
                success: true,
                message: "Todos fetched successfully"
            })
        })
    )


export const createTodo = (input: CreateTodoInput): Effect.Effect<
    ApiResponse<Todo>,
    BusinessError,
    never
> =>
    pipe(
        // Step 1: fetch POST
        Effect.tryPromise({
            try: () =>
                fetch(`${BASE_URL}/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(input)
                }),
            catch: (err: unknown) => {
                console.log("Dev Error (fetch)", err)
                return new UnexpectedError(
                    "Unable to insert a todo for now, please try later!"
                )
            }
        }),

        // Step 2: parse JSON
        Effect.flatMap((res) =>
            pipe(
                Effect.tryPromise<TodosResponse>(() => res.json() as Promise<TodosResponse>),
                Effect.mapError((err: unknown) => {
                    console.log("Dev Error (JSON parse)", err)
                    return new UnexpectedError(
                        "Error reading server response, please try again later"
                    )
                }),

                // Step 3: business validation
                Effect.flatMap((typed) => {
                    if (!res.ok)
                        return Effect.fail(
                            new NetworkError("Unable to fetch todos due to server error")
                        )
                    if (!typed.todos)
                        return Effect.fail(
                            new InvalidResponse(
                                "Todos data is missing in the server response"
                            )
                        )
            if (!Array.isArray(typed.todos))
              return Effect.fail(
                new TypeValidationError("Server returned invalid todos data")
              )
            if (typed.todos.length === 0)
              return Effect.fail(
                new InvalidResponse("No todo was created in the server response")
              )
  
            return Effect.succeed({
              data: typed.todos[0],
              success: true,
              message: "Todo created successfully"
            })
                })
            )
        )
    )




export const updateTodo = (input: UpdateTodoInput): Effect.Effect<ApiResponse<Todo[]>, BusinessError, never> =>
    pipe(
        Effect.tryPromise(() => fetch(`${BASE_URL}/${input.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input)
        })),
        Effect.mapError((err: unknown) => {
            console.log("Dev error (fetch):", err)
            return new UnexpectedError("unablel to update a todo, please try later")
        }),
        Effect.flatMap((res) =>
            pipe(
                Effect.tryPromise<TodosResponse>(() => res.json() as Promise<TodosResponse>),
                Effect.mapError((err: unknown) => {
                    console.log("DEV error", err)
                    return new UnexpectedError("error we couldnt do smg try later")
                }),
                Effect.flatMap((typed) => {
                    if (!res.ok) return Effect.fail(
                        new InvalidResponse("Todo have failed !")
                    )
                    if (!typed.todos) return Effect.fail(
                        new InvalidResponse("todo dont have the updated object")
                    )
                    return Effect.succeed({
                        data: typed.todos,
                        success: true,
                        message: "todo have updated succesfully"
                    })
                })
            )
        )
    )


export const deleteTodo = (todoId: string): Effect.Effect<ApiResponse<Todo[]>, BusinessError, never> =>
    pipe(
        Effect.tryPromise(() => fetch(`${BASE_URL}/${todoId}`, {
            method: "DELETE"
        })),
        Effect.mapError((err: unknown) => {
            console.log("DEV ERROR", err)
            return new UnexpectedError("unable to delete for now !")
        }),
        Effect.flatMap((res) =>
            pipe(
                Effect.tryPromise<TodosResponse>(() => res.json() as Promise<TodosResponse>),
                Effect.mapError((err: unknown) => {
                    console.log("DEV ERROR", err)
                    return new UnexpectedError("unable to delete!")
                }),
                Effect.flatMap((typed) => {
                    if (!res.ok) return Effect.fail(
                        new NetworkError("Unable to delete todo")
                    )
                    if (!typed.todos)
                        return Effect.fail(
                            new InvalidResponse("Unable to delete because the todo is missing after delete!")
                        )
                    return Effect.succeed({
                        data: typed.todos,
                        success: true,
                        message: "todos been correctly deleted"
                    })
                })
            )
        )
    )

