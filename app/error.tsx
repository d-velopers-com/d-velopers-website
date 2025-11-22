"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useLanguage } from "@/contexts/language-context";
import { typography, spacing, focusStates } from "@/lib/ui-constants";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    // Log the error to an error reporting service
    /* eslint-disable no-console */
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        <Card className="shadow-lg">
          <CardBody className={`flex flex-col items-center ${spacing.lg} p-8`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="text-6xl mb-4"
            >
              ⚠️
            </motion.div>
            <h2 className={`${typography.h2} text-center mb-2`}>
              {t.error.title}
            </h2>
            <p
              className={`${typography.body} text-center text-default-500 mb-6`}
            >
              {error.message || "Something unexpected happened"}
            </p>
            <Button
              className={focusStates.button}
              color="primary"
              size="lg"
              variant="shadow"
              onPress={reset}
            >
              {t.error.tryAgain}
            </Button>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
