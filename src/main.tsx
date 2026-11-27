import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme, theme as chakraTheme } from "@chakra-ui/react";

import App from "./App.tsx";

// Site palette: the cekimi.com.tr lime (#d9fb63) replaces the default blue accent.
const lime = {
  50: "#f7fee7",
  100: "#ecfccb",
  200: "#e2fb9e",
  300: "#d9fb63",
  400: "#e4fd8a",
  500: "#d9fb63",
  600: "#b8d94a",
  700: "#8fa83a",
  800: "#5f7224",
  900: "#2f3a12",
};

const baseSolid = (chakraTheme.components?.Button as { variants?: { solid?: (p: never) => unknown } } | undefined)?.variants?.solid;

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: { blue: lime },
  components: {
    Button: {
      variants: {
        solid: (props: Record<string, unknown>) => {
          const styles = (baseSolid?.(props as never) ?? {}) as Record<string, unknown>;
          if (props.colorScheme === "blue") {
            return { ...styles, bg: "blue.300", color: "gray.900", _hover: { bg: "blue.400", _disabled: { bg: "blue.300" } } };
          }
          return styles;
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
