import { createContext, useContext, useState, type ReactNode } from "react";
import type z from "zod";
import useBookingSchema from "~/services/schema/booking.schema";
const { ServiceItemSchema, ServiceCategoryEnum } = useBookingSchema();

interface ServiceContextType {
  selectedServices: any[];
  selectedRoom: string | null;
  addService: (service: any) => void;
  removeService: (id: string) => void;
  updateQuantity: (idOrQuantity: string | number, quantity?: number) => void;
  setRoom: (roomId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  isInCart: (id: string) => boolean;
  getQuantity: (id: string) => number;
  getServicesByCategory: (category: string) => any[];
}
type ServiceItem = z.infer<typeof ServiceItemSchema>;
const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export function ServiceProvider({
  children,
  initialServices = [],
}: {
  children: ReactNode;
  initialServices?: ServiceItem[];
}) {
  const [selectedServices, setSelectedServices] =
    useState<ServiceItem[]>(initialServices);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const addService = (service: any) => {
    setSelectedServices((prev) => {
      const exists = prev.find((item) => item.id === service.id);
      if (exists) {
        return prev.map((item) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + (service.quantity || 1) }
            : item
        );
      }
      return [...prev, { ...service, quantity: service.quantity || 1 }];
    });
  };

  const removeService = (id: string) => {
    setSelectedServices((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (
    idOrQuantity: string | number,
    maybeQuantity?: number
  ) => {
    if (typeof idOrQuantity === "string" && maybeQuantity !== undefined) {
      const id = idOrQuantity;
      const quantity = maybeQuantity;

      if (quantity <= 0) {
        removeService(id);
        return;
      }

      setSelectedServices((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const setRoom = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  const clearCart = () => {
    setSelectedServices([]);
  };

  const getTotalAmount = () => {
    return selectedServices.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return selectedServices.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (id: string) => {
    return selectedServices.some((item) => item.id === id);
  };

  const getQuantity = (id: string) => {
    const service = selectedServices.find((item) => item.id === id);
    return service ? service.quantity : 0;
  };

  const getServicesByCategory = (category: string) => {
    return selectedServices.filter((item) => item.category === category);
  };

  return (
    <ServiceContext.Provider
      value={{
        selectedServices,
        selectedRoom,
        addService,
        removeService,
        updateQuantity,
        setRoom,
        clearCart,
        getTotalAmount,
        getTotalItems,
        isInCart,
        getQuantity,
        getServicesByCategory,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
}

export function useServiceContext() {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error("useServiceContext must be used within a ServiceProvider");
  }
  return context;
}
