import { expect } from "vitest";
import { toEqualMoment } from "./toEqualMoment";

// Also see vitest.d.ts
expect.extend({ toEqualMoment });

// import { afterEach } from 'vitest'
// import { cleanup } from '@testing-library/react'
//
// // runs a clean after each test case (e.g. clearing jsdom)
// afterEach(() => {
//   cleanup();
// })
