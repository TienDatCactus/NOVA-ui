import { createContext, useContext, useState, type ReactNode } from "react";
import type z from "zod";
import useMenuSchema from "~/services/schema/menu.schema";
import useServiceSchema from "~/services/schema/service.schema";

const { ServiceItem2Schema, ServiceCategoryEnum } = useServiceSchema();
const { MenuItemSchema } = useMenuSchema();

// Type definitions for the items
type ServiceItem = z.infer<typeof ServiceItem2Schema> & {
  quantity: number;
  imageUrl?: string;
  category?: string;
};

type MenuItem = z.infer<typeof MenuItemSchema> & {
  quantity: number;
  imageUrl?: string;
  category?: string;
};

// Define a discriminated union type for cart items
type CartItem =
  | ({ type: "service" } & ServiceItem)
  | ({ type: "menu" } & MenuItem);

// Type guard functions
const isServiceItem = (item: any): item is ServiceItem =>
  "serviceItemId" in item;
const isMenuItem = (item: any): item is MenuItem => "itemId" in item;

interface ServiceContextType {
  selectedServices: CartItem[];
  selectedRoom: string | null;
  addService: (service: ServiceItem | MenuItem) => void;
  removeService: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setRoom: (roomId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  isInCart: (itemId: string) => boolean;
  getQuantity: (itemId: string) => number;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export function ServiceProvider({
  children,
  initialServices = [],
}: {
  children: ReactNode;
  initialServices?: CartItem[];
}) {
  const [selectedServices, setSelectedServices] =
    useState<CartItem[]>(initialServices);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const addService = (service: ServiceItem | MenuItem) => {
    setSelectedServices((prev) => {
      // Determine if it's a service item or menu item
      const isService = isServiceItem(service);
      const isMenu = isMenuItem(service);

      if (!isService && !isMenu) {
        console.error("Invalid item type", service);
        return prev;
      }

      const itemId = isService ? service.serviceItemId : service.itemId;
      const type = isService ? "service" : "menu";

      // Check if item already exists in cart
      const existingItemIndex = prev.findIndex((item) => {
        if (item.type === "service" && isService) {
          return item.serviceItemId === itemId;
        }
        if (item.type === "menu" && isMenu) {
          return item.itemId === itemId;
        }
        return false;
      });

      if (existingItemIndex !== -1) {
        // Update existing item
        return prev.map((item, index) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: item.quantity + (service.quantity || 1),
            };
          }
          return item;
        });
      }

      // Add new item with the appropriate type
      return [
        ...prev,
        {
          ...service,
          type,
          quantity: service.quantity || 1,
        } as CartItem,
      ];
    });
  };

  const removeService = (itemId: string) => {
    setSelectedServices((prev) =>
      prev.filter((item) => {
        if (item.type === "service") {
          return item.serviceItemId !== itemId;
        } else {
          return item.itemId !== itemId;
        }
      })
    );
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeService(itemId);
      return;
    }

    setSelectedServices((prev) =>
      prev.map((item) => {
        if (item.type === "service" && item.serviceItemId === itemId) {
          return { ...item, quantity };
        } else if (item.type === "menu" && item.itemId === itemId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const setRoom = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  const clearCart = () => {
    setSelectedServices([]);
  };

  const getTotalAmount = () => {
    return selectedServices.reduce((total, item) => {
      if (item.type === "service") {
        return total + item.basePrice * item.quantity;
      } else {
        return total + item.price * item.quantity;
      }
    }, 0);
  };

  const getTotalItems = () => {
    return selectedServices.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (itemId: string) => {
    return selectedServices.some((item) => {
      if (item.type === "service") {
        return item.serviceItemId === itemId;
      } else {
        return item.itemId === itemId;
      }
    });
  };

  const getQuantity = (itemId: string) => {
    const service = selectedServices.find((item) => {
      if (item.type === "service") {
        return item.serviceItemId === itemId;
      } else {
        return item.itemId === itemId;
      }
    });
    return service ? service.quantity : 0;
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
