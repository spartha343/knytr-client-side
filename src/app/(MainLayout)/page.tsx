"use client";

// TODO: Remove the use client
import Container from "@/components/shared/Container";
import { auth } from "@/firebase/firebase.config";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Home() {
  const [user] = useAuthState(auth);

  return (
    <Container>
      <h1 style={{ font: "50px" }}>Hello</h1>
      <p>This is the home page</p>
      <p>{user && user?.email}</p>
    </Container>
  );
}
