import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("App V2 clean rebuild", () => {
  it("renders only the V2 primary navigation surface at the root", () => {
    render(<App />);

    expect(screen.getByRole("complementary", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Knowledge Atlas" })).toBeInTheDocument();

    for (const label of ["Atlas", "Path", "Drill", "Review", "Settings"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }

    expect(screen.queryByRole("button", { name: "复盘" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "学习" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "下一次训练重点" })).not.toBeInTheDocument();
  });

  it("keeps root App state local to the selected V2 view", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Path" }));
    expect(screen.getByRole("heading", { name: "My Path" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Atlas" }));
    expect(screen.getByRole("heading", { name: "Knowledge Atlas" })).toBeInTheDocument();
  });
});
