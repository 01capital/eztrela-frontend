export function shuffleArray<T>(array: T[]): T[] {
  const arr=[...array]
  for(let i= arr.length-1; i>0; i--){
    const j= Math.floor(Math.random()*(i+1))
    ;[arr[i], arr[j]]= [arr[j], arr[i]]
  }
  return arr
}

/** For auto-resizing a textarea as user types */
export function autoResize(e: React.FormEvent<HTMLTextAreaElement>) {
  const el = e.currentTarget
  el.style.height= "auto"
  el.style.height= (el.scrollHeight+20)+"px"
}

/** The same dark style from your code */
export const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: "#343541",
    borderColor: state.isFocused ? "#696969" : "#3a3b44",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#696969",
    },
    color: "#e8e8e8",
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "#343541",
    border: "1px solid #3a3b44",
  }),
  option: (base: any, { isFocused }: any) => ({
    ...base,
    backgroundColor: isFocused ? "#4a4b53" : "#343541",
    color: "#e8e8e8",
    cursor: "pointer",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#e8e8e8",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "#888",
  }),
  input: (base: any) => ({
    ...base,
    color: "white",
  }),
}