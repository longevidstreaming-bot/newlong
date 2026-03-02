import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import React from 'react'

function App() {
  return (
    <>
      <ErrorBoundary>
        <Pages />
      </ErrorBoundary>
      <Toaster />
    </>
  )
}

export default App 

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    try {
      console.error('App runtime error:', error, info)
    } catch {}
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ backgroundColor: '#121212', color: '#fff', minHeight: '100vh', padding: '24px' }}>
          <h1 style={{ fontSize: '20px', marginBottom: '12px' }}>Falha ao carregar a aplicação</h1>
          <p style={{ opacity: 0.8 }}>
            {String(this.state.error?.message || this.state.error)}
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
