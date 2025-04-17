import Link from "next/link";
import { Button } from "@roro-ai/ui/components/ui/button";
import { FaGithub } from "react-icons/fa"


const SplitButton = () => {
  return (
    <Button
    variant={"ghost"}
    size={"icon"}
    className="border-primary rounded-full border border-gray-600"
    asChild
    >
        <Link
        href={"https://github.com/Daanish2003/roro-ai"}
        >
        <FaGithub />
        </Link>
    </Button>
  );
};

export default SplitButton;