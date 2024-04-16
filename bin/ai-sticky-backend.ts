#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AiStickyBackendStack } from "../stack/ai-sticky-backend-stack";

const app = new cdk.App();
new AiStickyBackendStack(app, "AiStickyBackendStack");
