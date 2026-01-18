import express from "express"
import { Effect } from "effect"
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "../api/todoApi"
import { CreateTodoInput, UpdateTodoInput } from "../models/todo"

const app = express()
const PORT = 3000

app.use(express.json())

// Get all todos
app.get("/todos", async (_, res) => {
    try {
        const result = await Effect.runPromise(fetchTodos())
        res.json(result)
    } catch (err: any) {
        console.error("Server error:", err)
        res.status(500).json({ message: err.message })
    }
})

// Create a new todo
app.post("/todos", async (req, res) => {
    try {
        const input: CreateTodoInput = req.body
        const result = await Effect.runPromise(createTodo(input))
        res.json(result)
    } catch (err: any) {
        console.error("Server error:", err)
        res.status(500).json({ message: err.message })
    }
})

// Update a todo
app.put("/todos/:id", async (req, res) => {
    try {
        const input: UpdateTodoInput = { id: req.params.id, ...req.body }
        const result = await Effect.runPromise(updateTodo(input))
        res.json(result)
    } catch (err: any) {
        console.error("Server error:", err)
        res.status(500).json({ message: err.message })
    }
})

// Delete a todo
app.delete("/todos/:id", async (req, res) => {
    try {
        const result = await Effect.runPromise(deleteTodo(req.params.id))
        res.json(result)
    } catch (err: any) {
        console.error("Server error:", err)
        res.status(500).json({ message: err.message })
    }
})

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    server.close(() => {
        console.log('HTTP server closed')
    })
})

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server')
    server.close(() => {
        console.log('HTTP server closed')
        process.exit(0)
    })
})
