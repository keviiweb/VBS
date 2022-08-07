import React, { useEffect } from 'react';
import { useTable, usePagination } from 'react-table';
import {
  Flex,
  List,
  ListItem,
  IconButton,
  Text,
  Tooltip,
  Table,
  Tbody,
  Thead,
  Th,
  Tr,
  Td,
  Select,
  Stack,
  StackDivider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@chakra-ui/icons';

/**
 * Renders a responsive table that supports pagination
 *
 * @param param0 Column and data
 * @returns A rendered table
 */
export default function TableWidget({
  id,
  columns,
  data,
  controlledPageCount,
  dataHandler,
  showPage = true,
}) {
  const {
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount: controlledPageCount,
    },
    usePagination,
  );

  const variantDesktop = useBreakpointValue({ base: 'none', md: 'flex' });
  const variantMobile = useBreakpointValue({ base: 'flex', md: 'none' });

  useEffect(() => {
    async function sendData() {
      if (dataHandler) {
        await dataHandler({ pageIndex, pageSize });
      }
    }

    sendData();
  }, [dataHandler, pageIndex, pageSize]);

  return (
    <>
      <Stack direction='row' display={variantDesktop}>
        <Table
          key={`${id}-desktop-table`}
          variant='striped'
          size='md'
          colorScheme='facebook'
          style={{
            maxHeight: '600px',
          }}
        >
          <Thead>
            <Tr>
              {columns.map(
                (item: { Header: string; accessor: string }, idx: number) => (
                  <Th key={`th-${id}-${idx}`}>{item.Header}</Th>
                ),
              )}
            </Tr>
          </Thead>
          <Tbody>
            {page.map((row, idx) => {
              prepareRow(row);
              return (
                <Tr id={`tr-${id}-${idx}`} key={`tr-${id}-${idx}-${row.id}`}>
                  {row.cells.map((cell, idx2) => (
                    <Td key={`td-${id}-${idx}-${idx2}-${row.id}`}>
                      {cell.render('Cell')}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Stack>

      <Stack display={variantMobile} key={`${id}-mobile-table`}>
        <Stack divider={<StackDivider borderColor='gray.600' />}>
          {page.map((row, idx) => {
            prepareRow(row);
            return (
              <List w='full' key={`mobile-table-${idx}-${row.id}`}>
                {row.cells.map((cell, idx2) => (
                  <ListItem key={`mobile-table-text-${idx2 + 10000}`}>
                    <Text as='span' fontWeight='bold'>
                      {columns[idx2].Header}:{' '}
                    </Text>
                    {cell.render('Cell')}
                  </ListItem>
                ))}
              </List>
            );
          })}
        </Stack>
      </Stack>

      {showPage && (
        <Flex justifyContent='space-between' m={4} alignItems='center'>
          <Flex>
            <Tooltip label='First Page'>
              <IconButton
                onClick={() => gotoPage(0)}
                isDisabled={!canPreviousPage}
                icon={<ArrowLeftIcon h={3} w={3} />}
                mr={4}
                aria-label=''
              />
            </Tooltip>
            <Tooltip label='Previous Page'>
              <IconButton
                onClick={previousPage}
                isDisabled={!canPreviousPage}
                icon={<ChevronLeftIcon h={6} w={6} />}
                aria-label=''
              />
            </Tooltip>
          </Flex>

          <Flex alignItems='center'>
            <Text mr={8}>
              Page{' '}
              <Text fontWeight='bold' as='span'>
                {pageIndex + 1}
              </Text>{' '}
              of{' '}
              <Text fontWeight='bold' as='span'>
                {pageOptions.length}
              </Text>
            </Text>
            <Text>Go to page:</Text>{' '}
            <NumberInput
              ml={2}
              mr={8}
              w={28}
              min={1}
              max={pageOptions.length}
              onChange={(value) => {
                const pageID = Number(value) ? Number(value) - 1 : 0;
                gotoPage(pageID);
              }}
              defaultValue={pageIndex + 1}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Select
              w={32}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSizeID) => (
                <option key={pageSizeID} value={pageSizeID}>
                  Show {pageSizeID}
                </option>
              ))}
            </Select>
          </Flex>

          <Flex>
            <Tooltip label='Next Page'>
              <IconButton
                onClick={nextPage}
                isDisabled={!canNextPage}
                icon={<ChevronRightIcon h={6} w={6} />}
                aria-label=''
              />
            </Tooltip>
            <Tooltip label='Last Page'>
              <IconButton
                onClick={() => gotoPage(pageCount - 1)}
                isDisabled={!canNextPage}
                icon={<ArrowRightIcon h={3} w={3} />}
                ml={4}
                aria-label=''
              />
            </Tooltip>
          </Flex>
        </Flex>
      )}
    </>
  );
}
