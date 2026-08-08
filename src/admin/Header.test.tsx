import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Header from "./Header";

describe("admin Header", () => {
  test("marks the link matching the current route as active", () => {
    render(
      <MemoryRouter initialEntries={["/admin/templates"]}>
        <Header onLogout={jest.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Templates" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Categories" })).not.toHaveClass("active");
  });

  test("confirms and calls onLogout", async () => {
    const onLogout = jest.fn();
    render(
      <MemoryRouter initialEntries={["/admin/categories"]}>
        <Header onLogout={onLogout} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: "Yes" }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
