import { getServerSession } from "next-auth/next";
import { getSession } from "next-auth/react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const getAuthSession = () => getServerSession(authOptions);

export { getSession };

