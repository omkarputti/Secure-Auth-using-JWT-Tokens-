import React from "react"
import ReactDOM from "react-dom/client"
import { ChakraProvider, Center } from "@chakra-ui/react"
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider>
    <Center minH="100vh" w="100%">
      <App />
    </Center>
  </ChakraProvider>
)
