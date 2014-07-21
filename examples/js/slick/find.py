


import os, glob,sys
def dir():
	i = 0
	for f in glob.glob(sys.argv[1]+".*"):
		i = i+1
		print i
		#print f+"hhhh"
		d = open(f,'r').read()
		if sys.argv[2] in d:
			print f
dir()