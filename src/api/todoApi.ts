import { Effect, pipe } from "effect"
import fetch from "node-fetch"
import { ApiResponse, CreateTodoInput, Todo, TodosResponse, UpdateTodoInput } from "../models/todo"

class NetworkError extends Error { }
class InvalidResponse extends Error { }
class TypeValidationError extends Error { }

class UnexpectedError extends Error { }

type BusinessError = NetworkError | InvalidResponse | TypeValidationError


const BASE_URL = "https://dummyjson.com/todos"

export const fetchTodos = (): Effect.Effect<unknown, BusinessError, ApiResponse<Todo[]>> =>
    pipe(
        // Step 1: fetch
        Effect.tryPromise(() => fetch(BASE_URL)),
        Effect.mapError((err: unknown) => {
            console.log("Dev Error (fetch):", err)
            // User-friendly message in UnexpectedError
            return new UnexpectedError("Unable to fetch todos, please try again later")
        }),

        // Step 2: parse JSON
        Effect.flatMap((res) =>
            pipe(
                Effect.tryPromise<TodosResponse>(() => res.json() as Promise<TodosResponse>),
                Effect.mapError((err: unknown) => {
                    console.log("Dev Error (JSON parse):", err)
                    return new UnexpectedError("Error reading server response, please try again later")
                }),

                // Step 3: business validation
                Effect.flatMap((typed) => {
                    if (!res.ok)
                        return Effect.fail(
                            new NetworkError("Unable to fetch todos due to server error")
                        )
                    if (!typed.todos)
                        return Effect.fail(
                            new InvalidResponse("Todos data is missing in the server response")
                        )
                    if (!Array.isArray(typed.todos))
                        return Effect.fail(
                            new TypeValidationError("Server returned invalid todos data")
                        )

                    // Success
                    return Effect.succeed({
                        data: typed.todos,
                        success: true,
                        message: "Todos fetched successfully"
                    })
                })
            )
        )
    )


export const createTodo = (input: CreateTodoInput): Effect.Effect<unknown, BusinessError, ApiResponse<Todo>> =>
    pipe(
        Effect.tryPromise(() => fetch(`${BASE_URL}/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input)
        })),
        Effect.mapError((err: unknown) => {
            console.log("Dev Error (fetch)", err)
            return new UnexpectedError("Unable to insert a todo for now, pleasse try later !")
        }),

        Effect.flatMap((res) =>
            pipe(
                Effect.tryPromise<TodosResponse>(() => res.json() as Promise<TodosResponse>),
                Effect.mapError((err: unknown) => {
                    console.log("DEV ERROR FOR LOGS", err)
                    return new UnexpectedError("Eror for user we couldnt do something go do something else until we fix it !")
                }),
                Effect.flatMap((json) => {
                    if (!res.ok) {
                        return Effect.fail(
                            new NetworkError("Unable to fetch todos due to server error")
                        )
                    }
                    if (!json.todos)
                        return Effect.fail(
                            new InvalidResponse("Todos data is missing in the server response")
                        )
                    if (!Array.isArray(json.todos))
                        return Effect.fail(
                            new TypeValidationError("Server returned invalid todos data")
                        )

                    // Success
                    return Effect.succeed({
                        data: json.todos,
                        success: true,
                        message: "Todos fetched successfully"
                    })
                })
            )



        ),
    )


export const updateTodo = (input: UpdateTodoInput): Effect.Effect<unknown, BusinessError, ApiResponse<Todo>> =>
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


export const deleteTodo = (todoId: string): Effect.Effect<unknown, BusinessError, ApiResponse<Todo>> =>
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

