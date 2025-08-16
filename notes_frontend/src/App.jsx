"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Heading,
  Text,
  IconButton,
  useToast,
  Container,
  Card,
  CardBody,
  Badge,
  Divider,
  Flex,
  Avatar,
  useColorModeValue,
  Center,
} from "@chakra-ui/react"
import { DeleteIcon, AddIcon } from "@chakra-ui/icons"

const API_BASE = "https://secure-auth-using-jwt-tokens-1.onrender.com/api" // change if your backend host differs

export default function App() {
  const toast = useToast()

  const bgGradient = useColorModeValue("linear(to-br, white, gray.50)", "linear(to-br, gray.900, gray.800)")
  const cardBg = useColorModeValue("white", "gray.800")
  const primaryColor = "#0891b2"
  const accentColor = "#ec4899"

  // Auth
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loadingAuth, setLoadingAuth] = useState(false)

  // Notes
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState("")
  const [loadingNotes, setLoadingNotes] = useState(false)

  // helper to send requests with auth header when token exists
  async function apiFetch(path, opts = {}) {
    const headers = opts.headers || {}
    if (token) headers["Authorization"] = `Bearer ${token}`
    if (opts.body && !(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers })
    // auto logout on 401
    if (res.status === 401) {
      logout()
      throw new Error("Session expired. You were logged out.")
    }
    return res
  }

  // -------- Auth actions --------
  async function register() {
    if (!email || !password) return toast({ status: "warning", title: "Enter email/password" })
    try {
      setLoadingAuth(true)
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Register failed")
      toast({ status: "success", title: "Registered — now login" })
    } catch (err) {
      toast({ status: "error", title: err.message })
    } finally {
      setLoadingAuth(false)
    }
  }

  async function login() {
    if (!email || !password) return toast({ status: "warning", title: "Enter email/password" })
    try {
      setLoadingAuth(true)
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")
      setToken(data.access_token)
      localStorage.setItem("token", data.access_token)
      toast({ status: "success", title: "Logged in" })
      fetchNotes()
    } catch (err) {
      toast({ status: "error", title: err.message })
    } finally {
      setLoadingAuth(false)
    }
  }

  function logout() {
    setToken(null)
    localStorage.removeItem("token")
    setNotes([])
    toast({ status: "info", title: "Logged out" })
  }

  // -------- Notes actions --------
  async function fetchNotes() {
    if (!token) return
    try {
      setLoadingNotes(true)
      const res = await apiFetch("/notes")
      if (!res.ok) throw new Error("Failed to load notes")
      const data = await res.json()
      setNotes(data)
    } catch (err) {
      // error thrown already handles logout if 401
      toast({ status: "error", title: err.message })
    } finally {
      setLoadingNotes(false)
    }
  }

  async function addNote() {
    const text = noteText.trim()
    if (!text) return toast({ status: "warning", title: "Type a note" })
    try {
      const res = await apiFetch("/notes", {
        method: "POST",
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to add")
      }
      setNoteText("")
      fetchNotes()
    } catch (err) {
      toast({ status: "error", title: err.message })
    }
  }

  async function deleteNote(id) {
    try {
      const res = await apiFetch(`/notes/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      fetchNotes()
    } catch (err) {
      toast({ status: "error", title: err.message })
    }
  }

  // load notes when token changes (e.g., after login)
  useEffect(() => {
    if (token) fetchNotes()
  }, [token])

  // -------- UI --------
  if (!token) {
    return (
      <Center minH="100vh" bgGradient={bgGradient} py={12}>
        <Container maxW="md">
          <Card bg={cardBg} shadow="2xl" borderRadius="2xl" overflow="hidden" w="full">
            <CardBody p={10}>
              <VStack spacing={8} align="center">
                <VStack spacing={4} textAlign="center">
                  <Avatar size="xl" bg={primaryColor} icon={<Text fontSize="3xl">📝</Text>} />
                  <Heading size="xl" fontWeight="bold" color="gray.800">
                    Welcome to Notes
                  </Heading>
                  <Text color="gray.600" fontSize="lg">
                    Your personal note-taking companion
                  </Text>
                </VStack>

                <Divider />

                <VStack spacing={5} w="full" maxW="md">
                  <Input
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    focusBorderColor={primaryColor}
                    bg="gray.50"
                    border="2px"
                    borderColor="gray.100"
                    _hover={{ borderColor: primaryColor }}
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    focusBorderColor={primaryColor}
                    bg="gray.50"
                    border="2px"
                    borderColor="gray.100"
                    _hover={{ borderColor: primaryColor }}
                  />

                  <VStack spacing={3} w="full">
                    <Button
                      bg={primaryColor}
                      color="white"
                      size="lg"
                      w="full"
                      borderRadius="xl"
                      onClick={login}
                      isLoading={loadingAuth}
                      _hover={{ bg: "#0e7490" }}
                      _active={{ bg: "#155e75" }}
                      fontWeight="semibold"
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      borderColor={accentColor}
                      color={accentColor}
                      size="lg"
                      w="full"
                      borderRadius="xl"
                      onClick={register}
                      isLoading={loadingAuth}
                      _hover={{ bg: accentColor, color: "white" }}
                      fontWeight="semibold"
                    >
                      Create Account
                    </Button>
                  </VStack>
                </VStack>

                <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
                  Secure authentication with JWT tokens
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Center>
    )
  }

  return (
    <Center minH="100vh" bgGradient={bgGradient} py={8}>
      <Container maxW="2xl">
        <VStack spacing={8} align="center" w="full">
          {/* Header */}
          <Card bg={cardBg} shadow="xl" borderRadius="2xl" w="full">
            <CardBody p={6}>
              <Flex align="center" justify="space-between">
                <HStack spacing={4}>
                  <Avatar size="md" bg={primaryColor} icon={<Text fontSize="xl">📝</Text>} />
                  <VStack align="start" spacing={0}>
                    <Heading size="lg" color="gray.800">
                      My Notes
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      {notes.length} {notes.length === 1 ? "note" : "notes"}
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  colorScheme="red"
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  borderRadius="lg"
                  fontWeight="semibold"
                >
                  Sign Out
                </Button>
              </Flex>
            </CardBody>
          </Card>

          {/* Add Note */}
          <Card bg={cardBg} shadow="xl" borderRadius="2xl" w="full">
            <CardBody p={6}>
              <VStack spacing={4} align="center">
                <Heading size="md" color="gray.800" alignSelf="start">
                  Add New Note
                </Heading>
                <HStack w="full" spacing={4}>
                  <Input
                    placeholder="What's on your mind?"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    focusBorderColor={primaryColor}
                    bg="gray.50"
                    border="2px"
                    borderColor="gray.100"
                    _hover={{ borderColor: primaryColor }}
                    flex="1"
                  />
                  <Button
                    bg={primaryColor}
                    color="white"
                    size="lg"
                    borderRadius="xl"
                    onClick={addNote}
                    leftIcon={<AddIcon />}
                    _hover={{ bg: "#0e7490" }}
                    _active={{ bg: "#155e75" }}
                    fontWeight="semibold"
                    px={8}
                  >
                    Add
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Notes List */}
          <Card bg={cardBg} shadow="xl" borderRadius="2xl" w="full">
            <CardBody p={6}>
              <VStack spacing={6} align="center" w="full">
                <HStack justify="space-between" w="full">
                  <Heading size="md" color="gray.800">
                    Your Notes
                  </Heading>
                  {notes.length > 0 && (
                    <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                      {notes.length} total
                    </Badge>
                  )}
                </HStack>

                {loadingNotes ? (
                  <Box textAlign="center" py={12} w="full">
                    <Text color="gray.500" fontSize="lg">
                      Loading your notes...
                    </Text>
                  </Box>
                ) : notes.length === 0 ? (
                  <Box textAlign="center" py={12} w="full">
                    <Text fontSize="6xl" mb={4}>
                      📝
                    </Text>
                    <Text color="gray.500" fontSize="lg" mb={2}>
                      No notes yet
                    </Text>
                    <Text color="gray.400" fontSize="md">
                      Start by adding your first note above
                    </Text>
                  </Box>
                ) : (
                  <VStack spacing={4} align="center" w="full">
                    {notes.map((n, index) => (
                      <Card
                        key={n.id}
                        bg="gray.50"
                        borderRadius="xl"
                        shadow="sm"
                        _hover={{ shadow: "md" }}
                        transition="all 0.2s"
                        w="full"
                      >
                        <CardBody p={5}>
                          <Flex align="center" justify="space-between">
                            <HStack spacing={4} flex="1">
                              <Avatar size="sm" bg={accentColor} color="white" name={`Note ${index + 1}`} />
                              <Text fontSize="md" color="gray.800" flex="1" lineHeight="tall">
                                {n.text}
                              </Text>
                            </HStack>
                            <IconButton
                              aria-label="Delete note"
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              variant="ghost"
                              size="sm"
                              borderRadius="lg"
                              onClick={() => deleteNote(n.id)}
                              _hover={{ bg: "red.50" }}
                            />
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Center>
  )
}
