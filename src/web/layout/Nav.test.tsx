import { render, screen } from "@testing-library/react";
import { TopBar } from "./Nav";

test("renders title", () => {
  render(<TopBar iconAndDialogs={[]} />);
  const text = screen.getByText(/mullah/i);
  expect(text).toBeInTheDocument();
});
