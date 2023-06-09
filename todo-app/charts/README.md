# Helm Chart for Todo App

This Helm chart is designed to deploy a Web5 Todo application on a Kubernetes cluster. The chart uses Argo for GitOps deployment, allowing for version-controlled and automated deployments. The todo app is a simple react project that is built with a docker command beforehand.

```bash
docker buildx build -f Dockerfile --platform linux/amd64 -t todo:0.1 .
```

## Overview

Here's a quick overview of the files and what they do:

1. **Chart.yaml**: This is the metadata about the Helm chart itself like the name of the chart, its version, and the app version.

2. **values.yaml**: This file defines the default values for the chart's configurable parameters. Parameters include the image repository and tag, the type of service, and the port number.

3. **templates/deployment.yaml**: This file defines the Kubernetes Deployment for the Todo app. It specifies that one replica of the app should be running, and it uses the image specified in `values.yaml`.

4. **templates/service.yaml**: This file defines the Kubernetes Service for the Todo app, which provides network access to the deployment. The type and port of the service are specified in `values.yaml`.

5. **templates/ingress.yaml**: This file defines the Istio VirtualService, which controls how traffic is routed to the app. The host and gateway for the VirtualService are specified in `values.yaml`.

6. **templates/networkpolicy.yaml**: This file defines an Istio AuthorizationPolicy, which controls access to the app. It allows traffic from the `istio-system` namespace to the `todo.tbddev.org` host.

## Usage

To install this chart on your Kubernetes cluster, first make sure you have Helm and Argo installed and correctly configured.

Then, clone this repository and install the chart with a release name of your choice. For example, to install with the release name `todo`:

```bash
helm install --create-namespace --namespace todo todo .
```

The app's image, service, Istio host, and Istio gateway are all configurable via values.yaml. You can override these values by creating your own values file and passing it during installation with -f myvalues.yaml.

For example, to use a different image and host:

```yaml
# myvalues.yaml
image:
  repository: myrepo/todo
  tag: 1.0.0
istio:
  host: myhost.example.com
```

```bash
helm install --create-namespace --namespace todo todo -f myvalues.yaml .
```

This makes the chart flexible and reusable for different environments or configurations.

## Conclusion
This Helm chart provides a convenient way to deploy the Todo app on any Kubernetes cluster. The chart also allows for version-controlled, automated deployments. Happy deploying!