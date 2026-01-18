export interface Todo {
    id: number
    title: string
    completed: boolean
    dueDate?: string
}

export interface TodoInput {
    title: string
    completed?: boolean
    dueDate?: string
}

export interface ApiResponse<T> {
    data: T
    success: boolean
    message?: string
}


export interface TodosResponse {
    todos: Todo[]
    total: number
    skip: number
    limit: number
}
export interface CreateTodoInput {
    todo: string
    completed?: boolean
    userId?: number
}

export interface UpdateTodoInput {
    id: number
    todo?: string
    completed?: boolean
  }
  