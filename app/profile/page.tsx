import { Link } from "@nextui-org/link";

export default function Profile() {
  return (
    <>
      <h1>Hi</h1>
      <Link href="/profile/gear">Gear</Link>
      <Link href="/profile/inventory">Inventory</Link>
    </>
  );
}
