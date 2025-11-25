import { Suspense } from "react";
import { useNavigation } from "../Navigation/useNavigation";
import { ShellRoot } from "./ShellRoot";
import { FallbackScreen } from "../Fallback/FallbackScreen";

export function Shell() {
  const { Component } = useNavigation();

  const SafeComponent = Component ?? FallbackScreen;

  return (
    <ShellRoot>
      <Suspense fallback={<FallbackScreen />}>
        <SafeComponent />
      </Suspense>
    </ShellRoot>
  );
}
