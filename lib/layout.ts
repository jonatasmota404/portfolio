export function larguraContainerPara(pathname: string | null): string {
  const isSobre = pathname?.includes("/sobre");
  return isSobre ? "max-w-[1380px] px-6" : "max-w-3xl px-4";
}