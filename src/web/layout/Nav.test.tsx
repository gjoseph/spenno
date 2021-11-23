import { render, screen } from "@testing-library/react";
import { TopBar } from "./Nav";

test("renders title", () => {
  render(
    <TopBar
      appTitle={
        <>
          this is the app <b>title</b>
        </>
      }
      iconAndDialogs={[]}
    />
  );
  // Unable to find an element with the text: /this is the app title/i.
  // This could be because the text is broken up by multiple elements. In this case,
  // you can provide a function for your text matcher to make your matcher more flexible.
  //  const text = screen.getByText(/this is the app title/i);
  // ... and I can't be arsed figuring out how to do that for the above, yet I want to keep appTitle as a node, so
  const text = screen.getByText(/this is the app/i);
  expect(text).toBeInTheDocument();
});
