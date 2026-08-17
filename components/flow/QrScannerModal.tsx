"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Camera, QrCode } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/BackButton";

interface QrScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QrScannerModal({ open, onOpenChange }: QrScannerModalProps) {
  const router = useRouter();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);

  React.useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    async function startCamera() {
      if (!open) return;
      setCameraError(null);
      setIsScanning(true);

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("현재 브라우저에서 카메라 기능에 접근할 수 없습니다.");
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          // If BarcodeDetector is supported natively in browser
          if ("BarcodeDetector" in window) {
            // @ts-expect-error - BarcodeDetector standard web API
            const barcodeDetector = new window.BarcodeDetector({
              formats: ["qr_code"],
            });

            const scanLoop = async () => {
              if (videoRef.current && videoRef.current.readyState === 4) {
                try {
                  const barcodes = await barcodeDetector.detect(videoRef.current);
                  if (barcodes.length > 0) {
                    const rawValue = barcodes[0].rawValue;
                    if (rawValue.includes("/order/")) {
                      const url = new URL(rawValue, window.location.origin);
                      onOpenChange(false);
                      router.push(url.pathname + url.search);
                      return;
                    }
                  }
                } catch {
                  // Ignore detection frame glitches
                }
              }
              animationFrameId = requestAnimationFrame(scanLoop);
            };

            animationFrameId = requestAnimationFrame(scanLoop);
          }
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "카메라 권한을 허용하지 않았거나 장치를 찾을 수 없습니다.";
        setCameraError(msg);
        setIsScanning(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [open, router, onOpenChange]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="relative items-center pb-2 text-center">
          <div className="absolute top-3 left-3">
            <BackButton
              onClick={() => onOpenChange(false)}
              label="QR 스캐너 닫기"
            />
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary mb-1 mt-1">
            <QrCode className="h-5 w-5" />
          </div>
          <DrawerTitle className="text-lg font-extrabold text-foreground">테이블 QR 코드 스캔</DrawerTitle>
          <DrawerDescription className="text-base font-medium text-muted-foreground">
            테이블의 QR 코드를 사각형 프레임 안에 비춰주세요
          </DrawerDescription>
        </DrawerHeader>

        <div className="relative mx-4 my-4 flex h-60 flex-col items-center justify-center overflow-hidden rounded-[22px] bg-neutral-900 text-white">
          {cameraError ? (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <Camera className="h-8 w-8 text-neutral-400" aria-hidden="true" />
              <p className="text-base text-neutral-300 font-medium">{cameraError}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2 text-base font-bold rounded-[12px]"
                onClick={() => {
                  onOpenChange(false);
                  router.push("/order/jumun-cafe-01?table=3");
                }}
              >
                샘플 매장(3번 테이블)으로 바로가기
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {/* Scanner guide box */}
              <div className="pointer-events-none absolute inset-8 rounded-[16px] border-2 border-primary border-dashed" />
              {isScanning && (
                <div className="pointer-events-none absolute bottom-3 rounded-full bg-black/65 px-3 py-1 text-base font-semibold text-white">
                  스캔 대기 중...
                </div>
              )}
            </>
          )}
        </div>

        <DrawerFooter className="flex flex-col gap-2 p-4 pt-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_80%,transparent_100%)]">
          <Button
            variant="default"
            size="lg"
            onClick={() => {
              onOpenChange(false);
              router.push("/order/jumun-cafe-01?table=3");
            }}
            className="w-full h-14 min-h-[56px] font-extrabold text-base rounded-[16px] bg-primary text-white shadow-none hover:bg-primary/95"
          >
            샘플 매장(3번 테이블)으로 테스트
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-12 min-h-[48px] font-bold text-muted-foreground rounded-[14px]"
          >
            닫기
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
