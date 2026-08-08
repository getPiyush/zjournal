import { render } from "@testing-library/react";

import LoadingPage from "./LoadingPage";

describe("LoadingPage", () => {
  test("renders the loading animation blobs", () => {
    const { container } = render(<LoadingPage />);
    expect(container.querySelector(".centered")).not.toBeNull();
    expect(container.querySelector(".blob-1")).not.toBeNull();
    expect(container.querySelector(".blob-2")).not.toBeNull();
  });
});
