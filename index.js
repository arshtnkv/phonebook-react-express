const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122'
  }
]

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body'));
app.use(express.static('dist'))

// GET HOME
app.get('/', (req, res) => {
  res.send(`
    <h1>Phonebook api</h1>
    <p><code>/api/persons</code></p>
    `)
})

// GET INFO
app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

// GET ALL
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

// GET ITEM
app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const person = persons.find(p => p.id === id)
  if(person) {
    res.json(person)
  } else {
    res.statusMessage ="error"
    res.status(404).end()
  }
})

// DELETE ITEM
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

// POST CREATE and added ITEM
const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}

app.post('/api/persons', (req, res) => {
  const {name, number} = req.body
    
  if (!name || !number) {
    return res.status(400).json({
      error: 'content missing'
    })
  }

  const nameExists = persons.some(person => person.name === name)

  if (nameExists) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }
  
  const person = {name: name, number: number, id: generateId()}
  persons = persons.concat(person)

  res.json(persons)
})

app.use(unknownEndpoint)

// PORT
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});