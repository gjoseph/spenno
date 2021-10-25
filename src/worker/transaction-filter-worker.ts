// So, here's how I got to a seemingly working webworker-based implementation
// https://aravindballa.com/writings/non-blocking-ui-react/
// https://github.com/developit/workerize-loader#readme
// https://medium.com/@bykovskimichael/how-to-use-web-worker-with-create-react-app-e1c1f1ba5279
// and last but not least https://github.com/developit/workerize-loader/issues/3
// particularly this comment https://github.com/developit/workerize-loader/issues/3#issuecomment-538730979
// This isn't exactly a complex function, but needs to be isolated for workerize-loader to do its thing.

// TODO: i wonder if it'll correctly import our libs
// block for `time` ms, then return the number of loops we could run in that time:
export function expensive(duration: number): number {
  const start = Date.now();
  let count = 0;
  while (Date.now() - start < duration) {
    count++;
  }
  return count;
}
