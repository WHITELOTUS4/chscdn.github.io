from setuptools import setup, find_packages

setup(
    name="chscdn",
    version="1.0.0",
    description="Cavernous Hoax Scanner's Content Distributive Network utitlity provides version 1",
    author="WHITE LOTUS",
    license="MIT",
    packages=find_packages(),
    package_data={"chscdn": ["main.py"]},
    include_package_data=True
)
