import React, { useState, useEffect, useRef } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "./constants";
import Output from "./Output";

const CodeEditor = ({ socketRef, roomId }) => {
  const editorRef = useRef(null);
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");

  // Initialize the editor and sync with the socket
  const onMount = (editor) => {
    editorRef.current = editor;
    editor.setValue(value);
    
    // Handle local changes and emit to socket
    editor.onDidChangeModelContent(() => {
      const code = editor.getValue();
      setValue(code);
      
      // Emit code changes to other clients
      if (socketRef?.current) {
        socketRef.current.emit("code-change", { roomId, code });
        console.log(code);
      }
    });
  };

  // Listen for incoming code changes from other users
  useEffect(() => {
    if (socketRef?.current) {
      const handleCodeChange = (data) => {
        if (data.roomId === roomId && data.code !== editorRef.current.getValue()) {
          editorRef.current.setValue(data.code);
        }
      };

      socketRef.current.on("code-change", handleCodeChange);

      return () => {
        socketRef.current.off("code-change", handleCodeChange);
      };
    }
  }, [roomId, socketRef]);

  // Update language and code snippet when language changes
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const newSnippet = CODE_SNIPPETS[lang] || "";
    setValue(newSnippet);
    editorRef.current?.setValue(newSnippet);
  };

  return (
    <Box>
      <HStack spacing={4}>
        <Box w="50%">
          <LanguageSelector
            language={language}
            onSelect={handleLanguageChange}
          />
          <Editor
            height="75vh"
            theme="vs-dark"
            language={language}
            value={value}
            onMount={onMount}
            options={{
              minimap: {
                enabled: false,
              },
            }}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};

export default CodeEditor;
