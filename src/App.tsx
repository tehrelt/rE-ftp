import "./App.css";
import {ConnectionForm} from "./components/forms/ConnectionForm.tsx";
import {Explorer} from "./components/Explorer.tsx";
import {LogWindow} from "./components/LogWindow.tsx";
import {test_messages} from "./types/Message.ts";
import {invoke} from "@tauri-apps/api";
import {Options} from "./types/Options.ts";

function App() {
  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  async function handleConnect(options: Options) {
      console.log("connect to ", options);
      // @ts-ignore
      let response = await invoke("connect", options);
      console.log(response);
  }

  return (
      <>
        <div className="container mx-auto relative">
          <h1 className="absolute font-extrabold text-3xl ">rE FTP</h1>
          <ConnectionForm onSubmit={handleConnect} />
          <Explorer />
          <LogWindow messages={test_messages} />
        </div>
      </>
  );
}

export default App;
