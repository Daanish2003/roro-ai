import Link from "next/link";
import { Button } from "@roro-ai/ui/components/ui/button";
import { FaGithub } from "react-icons/fa"


const SplitButton = () => {
  return (
    <Button
    variant={"outline"}
    size={"icon"}
    className="border-primary"
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