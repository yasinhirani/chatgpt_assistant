import { useEffect, useState } from "react";
import "./App.css";
import User from "./components/User";
import { OpenAIApi, Configuration } from "openai";

interface IResponses {
  role: string;
  content: string;
}

function App() {
  const [responses, setResponses] = useState<IResponses[] | null>(null);
  const [userText, setUserText] = useState<string>("");
  const [initialRender, setInitialRender] = useState<boolean>(true);

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    })
  );

  const getResponse = async () => {
    await openai
      .createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: userText,
          },
        ],
      })
      .then((res) => {
        setUserText("");
        if (res.data.choices[0].message) {
          setResponses((prev) => {
            if (prev) {
              prev.pop();
              prev.push(res.data.choices[0].message as IResponses);
              return [...prev];
            } else {
              return [];
            }
          });
        }
      });
  };

  useEffect(() => {
    if (initialRender) {
      setInitialRender(false);
      return;
    }
    getResponse();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses?.length]);

  return (
    <div className="w-full h-full flex flex-col bg-primary">
      <div className="w-full max-w-[60rem] mx-auto px-6 md:px-12 py-6 flex-grow h-full flex flex-col overflow-hidden">
        <div className="flex-grow h-full overflow-y-auto text-gray-300">
          <div className="flex flex-col">
            {responses &&
              responses.map((response) => {
                return (
                  <div key={Math.random()}>
                    {response && (
                      <User
                        responseText={response.content}
                        role={response.role}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
        <div className="mt-5 w-full bg-textBox shadow-md rounded-md flex items-center space-x-2 px-4 py-3">
          <input
            type="text"
            className="w-full outline-none text-gray-300 bg-transparent"
            onChange={(e) => setUserText(e.target.value)}
            value={userText}
          />
          <button
            type="button"
            onClick={() => {
              setResponses((prev) => {
                if (prev) {
                  return [
                    ...prev,
                    {
                      role: "user",
                      content: userText,
                    },
                    {
                      role: "assistant",
                      content: "...",
                    },
                  ];
                } else {
                  return [
                    {
                      role: "user",
                      content: userText,
                    },
                    {
                      role: "assistant",
                      content: "...",
                    },
                  ];
                }
              });
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 text-gray-400 -rotate-45"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
