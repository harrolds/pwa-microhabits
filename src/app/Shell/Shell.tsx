import { Suspense } from "react";
import { ShellRoot } from "./ShellRoot";
import { useNavigation } from "../Navigation/useNavigation";

export default function Shell() {
  const { Component } = useNavigation();

  return (
    <ShellRoot>
      <Suspense fallback={<p>Loading…</p>}>
        <Component />
      </Suspense>
    </ShellRoot>
  );
}
