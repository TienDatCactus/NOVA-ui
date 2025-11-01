/**
 * Button Showcase Component
 * Demonstrates all available button variants
 * Use this as a reference for button styling
 */

import type { Route } from "./+types/button-showcase";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Heart, Star, Check, AlertCircle, Info, Zap } from "lucide-react";

export function ButtonShowcase() {
  return (
    <div className="space-y-8 p-8">
      {/* Primary Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Variants</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="transparent">Transparent</Button>
        </CardContent>
      </Card>

      {/* Status Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Status Variants (Solid)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="success">
            <Check className="mr-2" />
            Success
          </Button>
          <Button variant="warning">
            <AlertCircle className="mr-2" />
            Warning
          </Button>
          <Button variant="info">
            <Info className="mr-2" />
            Info
          </Button>
          <Button variant="destructive">
            <AlertCircle className="mr-2" />
            Destructive
          </Button>
        </CardContent>
      </Card>

      {/* Status Outline Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Status Variants (Outline)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="success-outline">
            <Check className="mr-2" />
            Success Outline
          </Button>
          <Button variant="warning-outline">
            <AlertCircle className="mr-2" />
            Warning Outline
          </Button>
          <Button variant="info-outline">
            <Info className="mr-2" />
            Info Outline
          </Button>
        </CardContent>
      </Card>

      {/* Status Ghost Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Status Variants (Ghost)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="success-ghost">
            <Check className="mr-2" />
            Success Ghost
          </Button>
          <Button variant="warning-ghost">
            <AlertCircle className="mr-2" />
            Warning Ghost
          </Button>
          <Button variant="info-ghost">
            <Info className="mr-2" />
            Info Ghost
          </Button>
        </CardContent>
      </Card>

      {/* Color Variants - Solid */}
      <Card>
        <CardHeader>
          <CardTitle>Color Variants (Solid)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="purple">
            <Star className="mr-2" />
            Purple
          </Button>
          <Button variant="pink">
            <Heart className="mr-2" />
            Pink
          </Button>
          <Button variant="indigo">
            <Zap className="mr-2" />
            Indigo
          </Button>
          <Button variant="teal">Teal</Button>
          <Button variant="orange">Orange</Button>
        </CardContent>
      </Card>

      {/* Color Variants - Outline */}
      <Card>
        <CardHeader>
          <CardTitle>Color Variants (Outline)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="purple-outline">Purple Outline</Button>
          <Button variant="pink-outline">Pink Outline</Button>
          <Button variant="indigo-outline">Indigo Outline</Button>
          <Button variant="teal-outline">Teal Outline</Button>
          <Button variant="orange-outline">Orange Outline</Button>
        </CardContent>
      </Card>

      {/* Color Variants - Ghost */}
      <Card>
        <CardHeader>
          <CardTitle>Color Variants (Ghost)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="purple-ghost">Purple Ghost</Button>
          <Button variant="pink-ghost">Pink Ghost</Button>
          <Button variant="indigo-ghost">Indigo Ghost</Button>
          <Button variant="teal-ghost">Teal Ghost</Button>
          <Button variant="orange-ghost">Orange Ghost</Button>
        </CardContent>
      </Card>

      {/* Gradient Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Gradient Variants ✨</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="gradient">
            <Star className="mr-2" />
            Rainbow Gradient
          </Button>
          <Button variant="gradient-success">
            <Check className="mr-2" />
            Success Gradient
          </Button>
          <Button variant="gradient-sunset">
            <Heart className="mr-2" />
            Sunset Gradient
          </Button>
          <Button variant="gradient-ocean">
            <Zap className="mr-2" />
            Ocean Gradient
          </Button>
          <Button variant="shimmer">
            <Star className="mr-2" />
            Shimmer Effect
          </Button>
        </CardContent>
      </Card>

      {/* Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Sizes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="default">
            Small
          </Button>
          <Button size="default" variant="default">
            Default
          </Button>
          <Button size="lg" variant="default">
            Large
          </Button>
          <Button size="icon" variant="default">
            <Star />
          </Button>
        </CardContent>
      </Card>

      {/* Disabled State */}
      <Card>
        <CardHeader>
          <CardTitle>Disabled State</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button disabled>Default Disabled</Button>
          <Button variant="success" disabled>
            Success Disabled
          </Button>
          <Button variant="gradient" disabled>
            Gradient Disabled
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

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
  return <ButtonShowcase />;
}
