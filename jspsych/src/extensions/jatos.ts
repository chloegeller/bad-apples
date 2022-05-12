import {JsPsych, JsPsychExtension, JsPsychExtensionInfo} from "jspsych";
import _ from "lodash"

interface InitializeParameters {
  environment: "jatos" | "production" | "development"
  jatos: any,
  callback?: (jatos: any) => void
}

interface OnStartParameters {
}

interface OnLoadParameters {
}

interface OnFinishParameters {
  retrieve: string[],
}

type TrialSupportData = {
  [key: string]: string | undefined
}

type URLVars = {
  prolificID: string | number,
  sessionID: string | number,
  studyID: string | number,
}

/**
 * **EXTENSION-NAME**
 *
 * SHORT PLUGIN DESCRIPTION
 *
 * @author YOUR NAME
 * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
 */
class JATOSExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "jatos",
  };
  
  private prolificID: URLVars["prolificID"] = -1
  private studyID: URLVars["studyID"] = -1
  private sessionID: URLVars["sessionID"] = -1
  private supportData: TrialSupportData = {}
  
  private environment!: string
  private jatos!: any
  private redirectURL!: string
  
  constructor(private readonly jsPsych: JsPsych) {
    this.jsPsych = jsPsych
  }
  
  initialize(
    {environment, callback = (jatos) => {}}: InitializeParameters
  ): Promise<void> {
    this.environment = environment
    // @ts-expect-error
    this.jatos = this.environment === "jatos" ? jatos : undefined
    
    if (this.onJATOS) {
      this.prolificID = _.get(this.jatos, "urlQueryParameters.PROLIFIC_ID", -1)
      this.studyID = _.get(this.jatos, "urlQueryParameters.STUDY_ID", -1)
      this.sessionID = _.get(this.jatos, "urlQueryParameters.SESSION_ID", -1)
      this.redirectURL = this.jatos.batchJsonInput.redirectURL
    }
    
    this.jsPsych.data.addProperties(this.urlVars)
    
    this.addAbortButton(callback)
    
    return new Promise(async (resolve, reject) => {
      if (this.onJATOS)
        await this.jatos.submitResultData(this.urlVars)
      
      resolve();
    });
  };
  
  on_start({}: OnStartParameters): void {
    if (!this.onJATOS)
      return
    
  };
  
  on_load({}: OnLoadParameters): void {
    if (!this.onJATOS)
      return
  };
  
  on_finish({retrieve}: OnFinishParameters): { [key: string]: any } {
    const {current_trial_global: trial_index} = this.jsPsych.getProgress()
    const trial_data = this.jsPsych.data.get().filter({trial_index}).values()[0]
    
    for (const key of retrieve) {
      this.supportData[key.split(".").slice(-1)[0]] = _.get(trial_data, key)
    }
    
    console.log(this.supportData)
    
    return {}
  };
  
  get urlVars(): URLVars {
    if (_.keys(this.supportData).includes("prolificID") && this.prolificID == -1) {
      this.prolificID = this.supportData["prolificID"]
    }
    
    return {
      prolificID: this.prolificID,
      studyID: this.studyID,
      sessionID: this.sessionID,
    }
  }
  
  get onJATOS(): boolean {
    if (this.environment != "jatos") {
      console.warn("Not on JATOS. Simulating 'success'.")
      return false
    }
    // @ts-expect-error
    while (this.environment == "jatos" && typeof jatos == "undefined") {
      setTimeout(() => {}, 250)
    }
    // @ts-expect-error
    this.jatos = jatos
    return typeof this.jatos != "undefined"
  }
  
  get filename(): string {
    return `prolificID=${this.prolificID}-studyID=${this.studyID}`
  }
  
  async uploadJSON(): Promise<boolean> {
    if (!this.onJATOS)
      return true
    
    try {
      await this.jatos.uploadResultFile(this.jsPsych.data.get().json(), `${this.filename}.json`)
    } catch (e) {
      console.error(e)
      return false
    }
    
    return true
  }
  
  async uploadCSV(toCSV: Function): Promise<any> {
    const CSV = toCSV(this.jsPsych.data.get(), this.urlVars)
    if (!this.onJATOS) {
      console.warn("Not on JATOS. Simulating 'success'.")
      return CSV
    }
    
    try {
      await this.jatos.uploadResultFile(CSV, `${this.filename}.csv`)
    } catch (e) {
      console.error(e)
      return false
    }
    return CSV
  }
  
  async uploadResultData(): Promise<any> {
    const resultData = {
      ...this.urlVars, totalTime: this.jsPsych.getTotalTime(),
      supportData: this.supportData, data: this.jsPsych.data.get().json(),
      jatos: {}
    }
    if (!this.onJATOS) {
      return resultData
    }
    resultData.jatos = {workerID: this.jatos.workerId, responseID: this.jatos.resultId}
    
    try {
      await this.jatos.submitResultData(resultData)
    } catch (e) {
      console.error(e)
      return false
    }
    return true
  }
  
  async endStudy(): Promise<void> {
    if (!this.onJATOS)
      throw new Error("Not on JATOS. Short-circuiting.")
    
    await this.jatos.endStudyAndRedirect(this.redirectURL)
  }
  
  private addAbortButton(callback: InitializeParameters["callback"]) {
    if (document.querySelector("#quit-study")) return
    
    console.log("Adding abort button.")
    
    try {
      let abortBtn = document.createElement("button")
      abortBtn.id = "quit-study"
      abortBtn.type = "button"
      abortBtn.innerText = "Quit Study"
      abortBtn.addEventListener("click", () => {
        let abort = confirm("Are you sure you want to quit? You will not be compensated for this study if you do.")
        
        callback(this.jatos)
        
        if (abort)
          this.jatos.abortStudy("Aborted")
      })
      
      document.body.appendChild(abortBtn)
    } catch (e) {
      console.error("Failed to add abort button.")
    }
  }
}

export default JATOSExtension;