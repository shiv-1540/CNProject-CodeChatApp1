import React, { useState,useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import { Box, HStack } from "@chakra-ui/react";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../../Actions';
import Output from "./Output";
import LanguageSelector from './LanguageSelector';
import { CODE_SNIPPETS } from './constants';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const [language, setLanguage] = useState("javascript");
    const editorRef = useRef(null);
    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: 'javascript', json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

      // Update language and code snippet when language changes
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const newSnippet = CODE_SNIPPETS[lang] || "";
    setValue(newSnippet);
    editorRef.current?.setValue(newSnippet);
  };


    return(
         <Box>
           <HStack spacing={4} >
             <Box w="50%">
                <LanguageSelector
                   language={language}
                   onSelect={handleLanguageChange}
                />
                <textarea id="realtimeEditor"></textarea>;
            </Box>
            <Output editorRef={editorRef} language={language}  />
          </HStack>
        </Box>
    ); 
};

export default Editor;
