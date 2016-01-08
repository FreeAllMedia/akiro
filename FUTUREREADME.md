To use Akiro via command line, install globally via npm:

``` shell
npm install akiro -g
```


# Command Line Interface

**Note:** Akiro assumes that you have already setup your `~/.aws/credentials` file. If you have not, make sure that you do before you attempt to use Akiro.

## 1. Deploy The Akiro Packager Lambda

Before Akiro will work, you'll need to deploy the Akiro Packager Lambda by running the following command:

``` shell
$ akiro deploy
Deploying Akiro Lambda, please wait ......
Deployment complete.
```

## 2. Specify an S3 bucket

Akiro needs to know which bucket you want to put the packages zip file when it is done building. You can do this in two ways:

1. Provide a default bucket via:

	``` shell
	$ akiro bucket bucketNameHere
	Default S3 bucket set to "bucketNameHere"

	```

2. Provide a bucket on a per-call bases via the `--bucket` flag:

	``` shell
	$ akiro package sqlite3 --bucket=branchNameHere
	Building package, please wait ...........
	Package available at: http://branchNameHere.s3-us-east-1.amazonaws.com/packages.zip
	```

## 3. Compile Dependencies, Get Zip URL

**The Akiro CLI takes a bucket name as the first argument**, then one or more package names. It can also accept one or more options such as `--name` to specify the package file's eventual name on s3.

### 3.1 Zip the latest version of a package

If no version is supplied, the latest version of a package will be used.

``` shell
akiro package myS3Bucket sqlite3
Building package, please wait ...........
Package available at: http://myS3Bucket.s3-us-east-1.amazonaws.com/packages.zip
```

### 3.2 Zip a specific version of a package

To use a specific version of a package, use the following syntax:

``` shell
akiro package myS3Bucket sqlite3@1.1.0
Building package, please wait ...........
Package available at: http://myS3Bucket.s3-us-east-1.amazonaws.com/packages.zip
```

### 3.3 Zip multiple packages into a single file



``` shell
akiro package myS3Bucket sqlite3@1.1.0 temp@^1.0.0
Building package, please wait ...........
Package available at: http://myS3Bucket.s3-us-east-1.amazonaws.com/packages.zip
```

### 3.4 Specify the zip file name

By default Akiro will create a "packages.zip" file in the bucket you specify. If you want to change this name to something else, simply supply the `--name` flag at the end of your command.

``` shell
akiro package myS3Bucket sqlite3 --name=sqlite3.zip
Building package, please wait ...........
Package available at: http://myS3Bucket.s3-us-east-1.amazonaws.com/sqlite3.zip
```
