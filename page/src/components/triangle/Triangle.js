import "./index.less"

import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Chip from 'material-ui/Chip';
import QRCode from 'qrcode.react';
import Client from '../components/client/client';

const FSS = {
    FRONT: 0,
    BACK: 1,
    DOUBLE: 2,
    SVGNS: 'http://www.w3.org/2000/svg'
};

FSS.Array = typeof Float32Array === 'function' ? Float32Array : Array;

FSS.Utils = {
    isNumber: function(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
};

Math.PIM2 = Math.PI * 2;
Math.PID2 = Math.PI / 2;
Math.randomInRange = function(min, max) {
    return min + (max - min) * Math.random();
};
Math.clamp = function(value, min, max) {
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value;
};

FSS.Vector3 = {
    create: function(x, y, z) {
        var vector = new FSS.Array(3);
        this.set(vector, x, y, z);
        return vector;
    },
    clone: function(a) {
        var vector = this.create();
        this.copy(vector, a);
        return vector;
    },
    set: function(target, x, y, z) {
        target[0] = x || 0;
        target[1] = y || 0;
        target[2] = z || 0;
        return this;
    },
    setX: function(target, x) {
        target[0] = x || 0;
        return this;
    },
    setY: function(target, y) {
        target[1] = y || 0;
        return this;
    },
    setZ: function(target, z) {
        target[2] = z || 0;
        return this;
    },
    copy: function(target, a) {
        target[0] = a[0];
        target[1] = a[1];
        target[2] = a[2];
        return this;
    },
    add: function(target, a) {
        target[0] += a[0];
        target[1] += a[1];
        target[2] += a[2];
        return this;
    },
    addVectors: function(target, a, b) {
        target[0] = a[0] + b[0];
        target[1] = a[1] + b[1];
        target[2] = a[2] + b[2];
        return this;
    },
    addScalar: function(target, s) {
        target[0] += s;
        target[1] += s;
        target[2] += s;
        return this;
    },
    subtract: function(target, a) {
        target[0] -= a[0];
        target[1] -= a[1];
        target[2] -= a[2];
        return this;
    },
    subtractVectors: function(target, a, b) {
        target[0] = a[0] - b[0];
        target[1] = a[1] - b[1];
        target[2] = a[2] - b[2];
        return this;
    },
    subtractScalar: function(target, s) {
        target[0] -= s;
        target[1] -= s;
        target[2] -= s;
        return this;
    },
    multiply: function(target, a) {
        target[0] *= a[0];
        target[1] *= a[1];
        target[2] *= a[2];
        return this;
    },
    multiplyVectors: function(target, a, b) {
        target[0] = a[0] * b[0];
        target[1] = a[1] * b[1];
        target[2] = a[2] * b[2];
        return this;
    },
    multiplyScalar: function(target, s) {
        target[0] *= s;
        target[1] *= s;
        target[2] *= s;
        return this;
    },
    divide: function(target, a) {
        target[0] /= a[0];
        target[1] /= a[1];
        target[2] /= a[2];
        return this;
    },
    divideVectors: function(target, a, b) {
        target[0] = a[0] / b[0];
        target[1] = a[1] / b[1];
        target[2] = a[2] / b[2];
        return this;
    },
    divideScalar: function(target, s) {
        if (s !== 0) {
            target[0] /= s;
            target[1] /= s;
            target[2] /= s;
        } else {
            target[0] = 0;
            target[1] = 0;
            target[2] = 0;
        }
        return this;
    },
    cross: function(target, a) {
        var x = target[0];
        var y = target[1];
        var z = target[2];
        target[0] = y * a[2] - z * a[1];
        target[1] = z * a[0] - x * a[2];
        target[2] = x * a[1] - y * a[0];
        return this;
    },
    crossVectors: function(target, a, b) {
        target[0] = a[1] * b[2] - a[2] * b[1];
        target[1] = a[2] * b[0] - a[0] * b[2];
        target[2] = a[0] * b[1] - a[1] * b[0];
        return this;
    },
    min: function(target, value) {
        if (target[0] < value) {
            target[0] = value;
        }
        if (target[1] < value) {
            target[1] = value;
        }
        if (target[2] < value) {
            target[2] = value;
        }
        return this;
    },
    max: function(target, value) {
        if (target[0] > value) {
            target[0] = value;
        }
        if (target[1] > value) {
            target[1] = value;
        }
        if (target[2] > value) {
            target[2] = value;
        }
        return this;
    },
    clamp: function(target, min, max) {
        this.min(target, min);
        this.max(target, max);
        return this;
    },
    limit: function(target, min, max) {
        var length = this.length(target);
        if (min !== null && length < min) {
            this.setLength(target, min);
        } else if (max !== null && length > max) {
            this.setLength(target, max);
        }
        return this;
    },
    dot: function(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },
    normalise: function(target) {
        return this.divideScalar(target, this.length(target));
    },
    negate: function(target) {
        return this.multiplyScalar(target, -1);
    },
    distanceSquared: function(a, b) {
        var dx = a[0] - b[0];
        var dy = a[1] - b[1];
        var dz = a[2] - b[2];
        return dx * dx + dy * dy + dz * dz;
    },
    distance: function(a, b) {
        return Math.sqrt(this.distanceSquared(a, b));
    },
    lengthSquared: function(a) {
        return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
    },
    length: function(a) {
        return Math.sqrt(this.lengthSquared(a));
    },
    setLength: function(target, l) {
        var length = this.length(target);
        if (length !== 0 && l !== length) {
            this.multiplyScalar(target, l / length);
        }
        return this;
    }
};

FSS.Vector4 = {
    create: function(x, y, z, w) {
        var vector = new FSS.Array(4);
        this.set(vector, x, y, z);
        return vector;
    },
    set: function(target, x, y, z, w) {
        target[0] = x || 0;
        target[1] = y || 0;
        target[2] = z || 0;
        target[3] = w || 0;
        return this;
    },
    setX: function(target, x) {
        target[0] = x || 0;
        return this;
    },
    setY: function(target, y) {
        target[1] = y || 0;
        return this;
    },
    setZ: function(target, z) {
        target[2] = z || 0;
        return this;
    },
    setW: function(target, w) {
        target[3] = w || 0;
        return this;
    },
    add: function(target, a) {
        target[0] += a[0];
        target[1] += a[1];
        target[2] += a[2];
        target[3] += a[3];
        return this;
    },
    multiplyVectors: function(target, a, b) {
        target[0] = a[0] * b[0];
        target[1] = a[1] * b[1];
        target[2] = a[2] * b[2];
        target[3] = a[3] * b[3];
        return this;
    },
    multiplyScalar: function(target, s) {
        target[0] *= s;
        target[1] *= s;
        target[2] *= s;
        target[3] *= s;
        return this;
    },
    min: function(target, value) {
        if (target[0] < value) {
            target[0] = value;
        }
        if (target[1] < value) {
            target[1] = value;
        }
        if (target[2] < value) {
            target[2] = value;
        }
        if (target[3] < value) {
            target[3] = value;
        }
        return this;
    },
    max: function(target, value) {
        if (target[0] > value) {
            target[0] = value;
        }
        if (target[1] > value) {
            target[1] = value;
        }
        if (target[2] > value) {
            target[2] = value;
        }
        if (target[3] > value) {
            target[3] = value;
        }
        return this;
    },
    clamp: function(target, min, max) {
        this.min(target, min);
        this.max(target, max);
        return this;
    }
};

FSS.Color = function(hex, opacity) {
    this.rgba = FSS.Vector4.create();
    this.hex = hex || '#000000';
    this.opacity = FSS.Utils.isNumber(opacity) ? opacity : 1;
    this.set(this.hex, this.opacity);
};

FSS.Color.prototype = {
    set: function(hex, opacity) {
        hex = hex.replace('#', '');
        var size = hex.length / 3;
        this.rgba[0] = parseInt(hex.substring(size * 0, size * 1), 16) / 255;
        this.rgba[1] = parseInt(hex.substring(size * 1, size * 2), 16) / 255;
        this.rgba[2] = parseInt(hex.substring(size * 2, size * 3), 16) / 255;
        this.rgba[3] = FSS.Utils.isNumber(opacity) ? opacity : this.rgba[3];
        return this;
    },
    hexify: function(channel) {
        var hex = Math.ceil(channel * 255).toString(16);
        if (hex.length === 1) {
            hex = '0' + hex;
        }
        return hex;
    },
    format: function() {
        var r = this.hexify(this.rgba[0]);
        var g = this.hexify(this.rgba[1]);
        var b = this.hexify(this.rgba[2]);
        this.hex = '#' + r + g + b;
        return this.hex;
    }
};

FSS.Object = function() {
    this.position = FSS.Vector3.create();
};

FSS.Object.prototype = {
    setPosition: function(x, y, z) {
        FSS.Vector3.set(this.position, x, y, z);
        return this;
    }
};

FSS.Light = function(ambient, diffuse) {
    FSS.Object.call(this);
    this.ambient = new FSS.Color(ambient || '#FFFFFF');
    this.diffuse = new FSS.Color(diffuse || '#FFFFFF');
    this.ray = FSS.Vector3.create();
};

FSS.Light.prototype = Object.create(FSS.Object.prototype);


FSS.Vertex = function(x, y, z) {
    this.position = FSS.Vector3.create(x, y, z);
};

FSS.Vertex.prototype = {
    setPosition: function(x, y, z) {
        FSS.Vector3.set(this.position, x, y, z);
        return this;
    }
};

FSS.Triangle = function(a, b, c) {
    this.a = a || new FSS.Vertex();
    this.b = b || new FSS.Vertex();
    this.c = c || new FSS.Vertex();
    this.vertices = [this.a, this.b, this.c];
    this.u = FSS.Vector3.create();
    this.v = FSS.Vector3.create();
    this.centroid = FSS.Vector3.create();
    this.normal = FSS.Vector3.create();
    this.color = new FSS.Color();
    this.polygon = document.createElementNS(FSS.SVGNS, 'polygon');
    this.polygon.setAttributeNS(null, 'stroke-linejoin', 'round');
    this.polygon.setAttributeNS(null, 'stroke-miterlimit', '1');
    this.polygon.setAttributeNS(null, 'stroke-width', '1');
    this.computeCentroid();
    this.computeNormal();
};

FSS.Triangle.prototype = {
    computeCentroid: function() {
        this.centroid[0] = this.a.position[0] + this.b.position[0] + this.c.position[0];
        this.centroid[1] = this.a.position[1] + this.b.position[1] + this.c.position[1];
        this.centroid[2] = this.a.position[2] + this.b.position[2] + this.c.position[2];
        FSS.Vector3.divideScalar(this.centroid, 3);
        return this;
    },
    computeNormal: function() {
        FSS.Vector3.subtractVectors(this.u, this.b.position, this.a.position);
        FSS.Vector3.subtractVectors(this.v, this.c.position, this.a.position);
        FSS.Vector3.crossVectors(this.normal, this.u, this.v);
        FSS.Vector3.normalise(this.normal);
        return this;
    }
};

FSS.Geometry = function() {
    this.vertices = [];
    this.triangles = [];
    this.dirty = false;
};

FSS.Geometry.prototype = {
    update: function() {
        if (this.dirty) {
            var t, triangle;
            for (t = this.triangles.length - 1; t >= 0; t--) {
                triangle = this.triangles[t];
                triangle.computeCentroid();
                triangle.computeNormal();
            }
            this.dirty = false;
        }
        return this;
    }
};

FSS.Plane = function(width, height, segments, slices) {
    FSS.Geometry.call(this);
    this.width = width || 100;
    this.height = height || 100;
    this.segments = segments || 4;
    this.slices = slices || 4;
    this.segmentWidth = this.width / this.segments;
    this.sliceHeight = this.height / this.slices;

    // Cache Variables
    var x, y, v0, v1, v2, v3,
        vertex, triangle, vertices = [],
        offsetX = this.width * -0.5,
        offsetY = this.height * 0.5;

    // Add Vertices
    for (x = 0; x <= this.segments; x++) {
        vertices.push([]);
        for (y = 0; y <= this.slices; y++) {
            vertex = new FSS.Vertex(offsetX + x * this.segmentWidth, offsetY - y * this.sliceHeight);
            vertices[x].push(vertex);
            this.vertices.push(vertex);
        }
    }

    // Add Triangles
    for (x = 0; x < this.segments; x++) {
        for (y = 0; y < this.slices; y++) {
            v0 = vertices[x + 0][y + 0];
            v1 = vertices[x + 0][y + 1];
            v2 = vertices[x + 1][y + 0];
            v3 = vertices[x + 1][y + 1];
            t0 = new FSS.Triangle(v0, v1, v2);
            t1 = new FSS.Triangle(v2, v1, v3);
            this.triangles.push(t0, t1);
        }
    }
};

FSS.Plane.prototype = Object.create(FSS.Geometry.prototype);

/**
 * @class Material
 * @author Matthew Wagerfield
 */
FSS.Material = function(ambient, diffuse) {
    this.ambient = new FSS.Color(ambient || '#444444');
    this.diffuse = new FSS.Color(diffuse || '#FFFFFF');
    this.slave = new FSS.Color();
};

/**
 * @class Mesh
 * @author Matthew Wagerfield
 */
FSS.Mesh = function(geometry, material) {
    FSS.Object.call(this);
    this.geometry = geometry || new FSS.Geometry();
    this.material = material || new FSS.Material();
    this.side = FSS.FRONT;
    this.visible = true;
};

FSS.Mesh.prototype.update = function(lights, calculate) {
    var t, triangle, l, light, illuminance;
    // Update Geometry
    this.geometry.update();
    // Calculate the triangle colors
    if (calculate) {
        // Iterate through Triangles
        for (t = this.geometry.triangles.length - 1; t >= 0; t--) {
            triangle = this.geometry.triangles[t];
            // Reset Triangle Color
            FSS.Vector4.set(triangle.color.rgba);
            // Iterate through Lights
            for (l = lights.length - 1; l >= 0; l--) {
                light = lights[l];
                // Calculate Illuminance
                FSS.Vector3.subtractVectors(light.ray, light.position, triangle.centroid);
                FSS.Vector3.normalise(light.ray);
                illuminance = FSS.Vector3.dot(triangle.normal, light.ray);
                if (this.side === FSS.FRONT) {
                    illuminance = Math.max(illuminance, 0);
                } else if (this.side === FSS.BACK) {
                    illuminance = Math.abs(Math.min(illuminance, 0));
                } else if (this.side === FSS.DOUBLE) {
                    illuminance = Math.max(Math.abs(illuminance), 0);
                }
                // Calculate Ambient Light
                FSS.Vector4.multiplyVectors(this.material.slave.rgba, this.material.ambient.rgba, light.ambient.rgba);
                FSS.Vector4.add(triangle.color.rgba, this.material.slave.rgba);
                // Calculate Diffuse Light
                FSS.Vector4.multiplyVectors(this.material.slave.rgba, this.material.diffuse.rgba, light.diffuse.rgba);
                FSS.Vector4.multiplyScalar(this.material.slave.rgba, illuminance);
                FSS.Vector4.add(triangle.color.rgba, this.material.slave.rgba);
            }
            // Clamp & Format Color
            FSS.Vector4.clamp(triangle.color.rgba, 0, 1);
        }
    }
    return this;
};

FSS.Mesh.prototype = Object.create(FSS.Object.prototype);

/**
 * @class Scene
 * @author Matthew Wagerfield
 */
FSS.Scene = function() {
    this.meshes = [];
    this.lights = [];
};

FSS.Scene.prototype = {
    add: function(object) {
        if (object instanceof FSS.Mesh && !~this.meshes.indexOf(object)) {
            this.meshes.push(object);
        } else if (object instanceof FSS.Light && !~this.lights.indexOf(object)) {
            this.lights.push(object);
        }
        return this;
    },
    remove: function(object) {
        if (object instanceof FSS.Mesh && ~this.meshes.indexOf(object)) {
            this.meshes.splice(this.meshes.indexOf(object), 1);
        } else if (object instanceof FSS.Light && ~this.lights.indexOf(object)) {
            this.lights.splice(this.lights.indexOf(object), 1);
        }
        return this;
    }
};

FSS.Renderer = function() {
  this.width = 0;
  this.height = 0;
  this.halfWidth = 0;
  this.halfHeight = 0;
};

FSS.Renderer.prototype = {
  setSize: function(width, height) {
    if (this.width === width && this.height === height) return;
    this.width = width;
    this.height = height;
    this.halfWidth = this.width * 0.5;
    this.halfHeight = this.height * 0.5;
    return this;
  },
  clear: function() {
    return this;
  },
  render: function(scene) {
    return this;
  }
};


const Triangle = React.createClass({
    mixins: [PureRenderMixin],

    getInitialState() {},

    componentDidMount() {
        var me = this;

    },

    componentDidUpdate() {},

    render() {}

});

export default IndexPage;
