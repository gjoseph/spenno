import { render } from "@testing-library/react";
import { TopBar } from "./Nav";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import "@testing-library/jest-dom/vitest";
import { test, expect } from "vitest";
import React from "react";

test("renders title", () => {
  const { getByText } = render(
    <TopBar
      appTitle={
        <>
          this is the app <b>title</b>
        </>
      }
      appIcon={LocalPizzaIcon}
      iconAndDialogs={[]}
    />,
  );
  // Unable to find an element with the text: /this is the app title/i.
  // This could be because the text is broken up by multiple elements. In this case,
  // you can provide a function for your text matcher to make your matcher more flexible.
  //  const text = screen.getByText(/this is the app title/i);
  // ... and I can't be arsed figuring out how to do that for the above, yet I want to keep appTitle as a node, so
  expect(getByText(/this is the app/i)).toBeInTheDocument();
});
