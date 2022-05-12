import {JsPsych, JsPsychExtension, JsPsychExtensionInfo} from "jspsych";
import {createRoot, RootType} from "react-dom/client"
import {create} from "@mdx-js/mdx/lib/util/estree-util-create";

interface InitializeParameters {
}

interface OnStartParameters {
}

interface OnLoadParameters {
}

interface OnFinishParameters {
}

/**
 * **EXTENSION-NAME**
 *
 * SHORT PLUGIN DESCRIPTION
 *
 * @author YOUR NAME
 * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
 */
class ReactDOMExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "react",
  };
  
  private container: HTMLElement;
  protected root: any;
  
  constructor(private readonly jsPsych: JsPsych) {
    this.jsPsych = jsPsych
  }
  
  initialize({}: InitializeParameters): Promise<void> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };
  
  on_start({}): void {
    this.container = this.jsPsych.getDisplayElement()
    this.root = createRoot(this.container)
  };
  
  on_load({}: OnLoadParameters): void {
  };
  
  on_finish({}: OnFinishParameters): { [key: string]: any } {
    this.root.unmount()
    return {}
  };
  
  public render(component: Function, params: {} = {}): void {
    // console.log(params)
    this.root.render(component({jsPsych: this.jsPsych, ...params}))
  }
  
}

export default ReactDOMExtension;