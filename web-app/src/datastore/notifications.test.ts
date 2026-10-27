import { ApiError } from "./apiError";
import { Notice, notifyError, notifySuccess, subscribe } from "./notifications";

describe("notifications", () => {
  test("delivers notices to subscribers until they unsubscribe", () => {
    const received: Notice[] = [];
    const unsubscribe = subscribe((notice) => received.push(notice));

    notifySuccess("Saved");
    unsubscribe();
    notifySuccess("Not delivered");

    expect(received).toEqual([expect.objectContaining({ kind: "success", message: "Saved" })]);
  });

  test("adds the error's message as detail", () => {
    const received: Notice[] = [];
    const unsubscribe = subscribe((notice) => received.push(notice));

    notifyError("Couldn't save", new Error("disk full"));
    notifyError("Couldn't load");
    unsubscribe();

    expect(received.map((notice) => notice.message)).toEqual(["Couldn't save: disk full", "Couldn't load"]);
  });

  test.each([401, 403])("ignores %i rejections", (status) => {
    const received: Notice[] = [];
    const unsubscribe = subscribe((notice) => received.push(notice));

    notifyError("Couldn't save", new ApiError(status, "rejected"));
    unsubscribe();

    expect(received).toEqual([]);
  });
});
