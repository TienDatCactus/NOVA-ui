import React from "react";
import { Spinner } from "../../shadcn-io/spinner";
import { motion } from "framer-motion";
interface MapLoadingProps {}

const MapLoading = ({}: MapLoadingProps) => {
  return (
    <motion.div
      key="map-loading"
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background"
    >
      <Spinner />
      <span className="font-mono text-muted-foreground text-xs">
        Loading map...
      </span>
    </motion.div>
  );
};

export default MapLoading;
