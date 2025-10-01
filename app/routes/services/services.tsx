import SectionLayout from "~/components/layouts/sections";
import type { Route } from "./+types/services";
import { Card, CardContent } from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { NAV_ITEMS, SERVICES_ITEMS } from "~/lib/constants";
import Image from "~/components/ui/image";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <SectionLayout center>
      <div className="pb-10 text-center space-y-2">
        <h1 className="text-primary text-5xl font-bold">Welcome back, User!</h1>
        <p className=" text-muted-foreground text-base">
          Choose your moderation service.
        </p>
      </div>
      <div>
        <div className="flex gap-2 items-center my-2">
          <Select>
            <SelectTrigger className="w-96 bg-white">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {NAV_ITEMS.map((item) => {
                return (
                  <SelectItem key={item.title} value={item.title}>
                    {item.title}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button>Continue</Button>
        </div>
        <Image
          src="https://i1.sndcdn.com/artworks-000319378374-74lray-t1080x1080.jpg"
          alt="dat"
          width={600}
          height={400}
        />

        <div className="w-full flex justify-center my-2">
          <Carousel
            opts={{
              align: "center",
              containScroll: "trimSnaps",
              loop: true,
            }}
            className="w-full max-w-xl"
          >
            <CarouselContent>
              {SERVICES_ITEMS.map((item, index) => (
                <CarouselItem key={index} className="lg:basis-1/2 ">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <span className="text-3xl font-semibold">
                          {item.title}
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </SectionLayout>
  );
}
