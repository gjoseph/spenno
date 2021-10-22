import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders title", () => {
  render(<App />);
  const text = screen.getByText(/mullah/i);
  expect(text).toBeInTheDocument();
});
