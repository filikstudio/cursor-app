import { getServerSession } from "next-auth/next";
import { getSession } from "next-auth/react";

export const getAuthSession = () => getServerSession();

export { getSession };

